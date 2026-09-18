"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { saveDispatchedEmail } from "@/lib/email-store";

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface PendingSignUp {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  otp?: string;
  token?: string;
  confirmationUrl?: string;
  expiresAt: number;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  pendingSignUp: PendingSignUp | null;
  signIn: (email: string, password: string, portal?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, portal?: UserRole) => Promise<{ success: boolean; error?: string }>;
  initiateSignUpWithOtp: (name: string, email: string, password: string, portal?: UserRole) => Promise<{ success: boolean; otp?: string; confirmationUrl?: string; error?: string }>;
  verifySignUpOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  confirmAccount: (token: string, email?: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  resendSignUpOtp: (email: string) => Promise<{ success: boolean; otp?: string; confirmationUrl?: string; error?: string }>;
  clearPendingSignUp: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = "mozart_auth_session_v1";
const LOCAL_USERS_KEY = "mozart_registered_users_v1";
const LOCAL_PENDING_KEY = "mozart_pending_signup_v1";

const DEFAULT_USERS: Record<string, { password: string; user: AuthUser }> = {
  "admin@mozart.com": {
    password: "atelier2026",
    user: {
      id: "usr-admin-01",
      name: "Henri de Mozart",
      email: "admin@mozart.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
  },
  "client@mozart.com": {
    password: "password123",
    user: {
      id: "usr-cust-01",
      name: "Sophia Laurent",
      email: "client@mozart.com",
      role: "customer",
      createdAt: new Date().toISOString(),
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingSignUp, setPendingSignUp] = useState<PendingSignUp | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize stored users and session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsers = localStorage.getItem(LOCAL_USERS_KEY);
      if (!storedUsers) {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }

      const storedSession = localStorage.getItem(LOCAL_AUTH_KEY);
      if (storedSession) {
        try {
          setUser(JSON.parse(storedSession));
        } catch {
          // ignore
        }
      }

      const storedPending = localStorage.getItem(LOCAL_PENDING_KEY);
      if (storedPending) {
        try {
          setPendingSignUp(JSON.parse(storedPending));
        } catch {
          // ignore
        }
      }
    }

    // Check Supabase session if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          const sbUser = data.session.user;
          const role = (sbUser.user_metadata?.role as UserRole) || "customer";
          const current: AuthUser = {
            id: sbUser.id,
            name: sbUser.user_metadata?.name || sbUser.email?.split("@")[0] || "Client",
            email: sbUser.email || "",
            role,
            createdAt: sbUser.created_at,
          };
          setUser(current);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(current));
        }
      }).catch(() => {
        // Fallback already handled
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    const handleAuthSync = () => {
      if (typeof window !== "undefined") {
        const storedSession = localStorage.getItem(LOCAL_AUTH_KEY);
        if (storedSession) {
          try {
            setUser(JSON.parse(storedSession));
          } catch {
            // ignore
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleAuthSync);
    window.addEventListener("mozart_auth_changed", handleAuthSync);
    return () => {
      window.removeEventListener("storage", handleAuthSync);
      window.removeEventListener("mozart_auth_changed", handleAuthSync);
    };
  }, []);

  const signIn = async (email: string, password: string, portal: UserRole = "customer"): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Try Supabase Auth if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data.user) {
          const assignedRole = (data.user.user_metadata?.role as UserRole) || (cleanEmail.includes("admin") ? "admin" : "customer");
          
          // Role gate checking
          if (portal === "admin" && assignedRole !== "admin") {
            return { success: false, error: "Access denied. This account does not possess Studio Curator privileges." };
          }

          const authenticatedUser: AuthUser = {
            id: data.user.id,
            name: data.user.user_metadata?.name || cleanEmail.split("@")[0],
            email: cleanEmail,
            role: assignedRole,
            createdAt: data.user.created_at,
          };

          setUser(authenticatedUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authenticatedUser));
          return { success: true };
        }
      } catch (err) {
        console.warn("Supabase auth attempted, falling back to local credentials:", err);
      }
    }

    // 2. Resilient Local Fallback Auth
    let usersDb = DEFAULT_USERS;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        try {
          usersDb = { ...DEFAULT_USERS, ...JSON.parse(stored) };
        } catch {
          // ignore
        }
      }
    }

    const record = usersDb[cleanEmail];
    if (!record) {
      return { success: false, error: "No account found matching this email address." };
    }

    if (record.password !== cleanPassword) {
      return { success: false, error: "Incorrect password. Please verify your credentials." };
    }

    // Role enforcement
    if (portal === "admin" && record.user.role !== "admin") {
      return { success: false, error: "Access restricted. Curator credentials required for the Studio portal." };
    }

    setUser(record.user);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(record.user));
    }
    return { success: true };
  };

  // Direct signup without OTP (legacy / programmatic)
  const signUp = async (
    name: string,
    email: string,
    password: string,
    portal: UserRole = "customer"
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) return { success: false, error: "Please enter your full name." };
    if (!cleanEmail || !cleanEmail.includes("@")) return { success: false, error: "A valid email address is required." };
    if (cleanPassword.length < 6) return { success: false, error: "Password must contain at least 6 characters." };

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: portal,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      let currentUsers = DEFAULT_USERS;
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        try {
          currentUsers = { ...DEFAULT_USERS, ...JSON.parse(stored) };
        } catch {
          // ignore
        }
      }

      currentUsers[cleanEmail] = {
        password: cleanPassword,
        user: newUser,
      };

      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(currentUsers));
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
    }

    setUser(newUser);
    return { success: true };
  };

  // Initiate Sign Up with 6-Digit Email Verification Code
  const initiateSignUpWithOtp = async (
    name: string,
    email: string,
    password: string,
    portal: UserRole = "customer"
  ): Promise<{ success: boolean; otp?: string; confirmationUrl?: string; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) return { success: false, error: "Please enter your full name." };
    if (!cleanEmail || !cleanEmail.includes("@")) return { success: false, error: "A valid email address is required." };
    if (cleanPassword.length < 6) return { success: false, error: "Password must contain at least 6 characters." };

    // Check if email already registered
    let usersDb = DEFAULT_USERS;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        try {
          usersDb = { ...DEFAULT_USERS, ...JSON.parse(stored) };
        } catch {
          // ignore
        }
      }
    }

    if (usersDb[cleanEmail]) {
      return { success: false, error: "An account with this email address already exists. Please sign in." };
    }

    // Generate secure token and confirmation URL
    const generatedToken =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `mzt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
    const confirmationUrl = `${origin}/confirm?token=${encodeURIComponent(generatedToken)}&email=${encodeURIComponent(cleanEmail)}`;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const pending: PendingSignUp = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: portal,
      otp: generatedOtp,
      token: generatedToken,
      confirmationUrl,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    setPendingSignUp(pending);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_PENDING_KEY, JSON.stringify(pending));
    }

    // Try Supabase signUp in background
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: { name: cleanName, role: portal },
            emailRedirectTo: `${origin}/confirm`,
          },
        });
      } catch {
        // Handled via local fallback
      }
    }

    // Dispatch email via API (real Gmail SMTP and Webmail Store)
    try {
      fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: cleanName,
          code: generatedOtp,
          token: generatedToken,
          confirmationUrl,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.emailData) {
            saveDispatchedEmail({
              id: `msg-${Date.now()}`,
              to: cleanEmail,
              recipientName: cleanName,
              subject: data.emailData.subject,
              code: generatedOtp,
              token: generatedToken,
              confirmationUrl: data.confirmationUrl || confirmationUrl,
              sentAt: new Date().toISOString(),
              htmlContent: data.emailData.htmlContent,
            });
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }

    return { success: true, otp: generatedOtp, confirmationUrl };
  };

  // Verify 6-digit OTP code and activate account
  const verifySignUpOtp = async (
    email: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      return { success: false, error: "Please enter the complete 6-digit verification code." };
    }

    let pending = pendingSignUp;
    if (!pending && typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_PENDING_KEY);
      if (stored) {
        try {
          pending = JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }

    if (!pending || pending.email !== cleanEmail) {
      return { success: false, error: "No pending verification found for this email address. Please start registration again." };
    }

    if (Date.now() > pending.expiresAt) {
      return { success: false, error: "Verification code has expired. Please request a new code." };
    }

    // Try Supabase OTP verification if active
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: "signup",
        });
        if (!error) {
          console.log("Supabase OTP verified successfully.");
        }
      } catch {
        // Fallback to local code validation below
      }
    }

    // Local code match
    if (pending.otp !== cleanCode) {
      return { success: false, error: "Incorrect verification code. Please check the 6-digit code dispatched to your email." };
    }

    // Activate and register user
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: pending.name,
      email: pending.email,
      role: pending.role,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      let currentUsers = DEFAULT_USERS;
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        try {
          currentUsers = { ...DEFAULT_USERS, ...JSON.parse(stored) };
        } catch {
          // ignore
        }
      }

      currentUsers[cleanEmail] = {
        password: pending.password,
        user: newUser,
      };

      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(currentUsers));
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
      localStorage.removeItem(LOCAL_PENDING_KEY);
    }

    setPendingSignUp(null);
    setUser(newUser);
    return { success: true };
  };

  // Resend confirmation email with fresh link
  const resendSignUpOtp = async (email: string): Promise<{ success: boolean; otp?: string; confirmationUrl?: string; error?: string }> => {
    let pending = pendingSignUp;
    if (!pending && typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_PENDING_KEY);
      if (stored) {
        try {
          pending = JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }

    if (!pending) {
      return { success: false, error: "Session expired. Please fill out the registration form again." };
    }

    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const freshToken =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `mzt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
    const confirmationUrl = `${origin}/confirm?token=${encodeURIComponent(freshToken)}&email=${encodeURIComponent(pending.email)}`;

    const updated: PendingSignUp = {
      ...pending,
      otp: freshOtp,
      token: freshToken,
      confirmationUrl,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    setPendingSignUp(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_PENDING_KEY, JSON.stringify(updated));
    }

    // Dispatch fresh email via API
    try {
      fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pending.email,
          name: pending.name,
          code: freshOtp,
          token: freshToken,
          confirmationUrl,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.emailData) {
            saveDispatchedEmail({
              id: `msg-${Date.now()}`,
              to: pending.email,
              recipientName: pending.name,
              subject: data.emailData.subject,
              code: freshOtp,
              token: freshToken,
              confirmationUrl: data.confirmationUrl || confirmationUrl,
              sentAt: new Date().toISOString(),
              htmlContent: data.emailData.htmlContent,
            });
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }

    return { success: true, otp: freshOtp, confirmationUrl };
  };

  // Confirm email and activate account via confirmation link
  const confirmAccount = async (
    token: string,
    email?: string
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    const cleanToken = (token || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();

    let currentUsers = DEFAULT_USERS;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        try {
          currentUsers = { ...DEFAULT_USERS, ...JSON.parse(stored) };
        } catch {
          // ignore
        }
      }
    }

    // If user is already active and registered, return user
    if (cleanEmail && currentUsers[cleanEmail]) {
      const existingUser = currentUsers[cleanEmail].user;
      setUser(existingUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(existingUser));
        localStorage.removeItem(LOCAL_PENDING_KEY);
        window.dispatchEvent(new Event("mozart_auth_changed"));
      }
      return { success: true, user: existingUser };
    }

    let pending = pendingSignUp;
    if (!pending && typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_PENDING_KEY);
      if (stored) {
        try {
          pending = JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }

    if (!pending) {
      return {
        success: false,
        error: "No pending registration found for this confirmation link. Your account may already be activated.",
      };
    }

    const isMatch =
      (pending.token && pending.token === cleanToken) ||
      (cleanEmail && pending.email === cleanEmail) ||
      (pending.otp && pending.otp === cleanToken);

    if (!isMatch) {
      return {
        success: false,
        error: "Invalid confirmation token. Please request a new activation email.",
      };
    }

    if (Date.now() > pending.expiresAt) {
      return {
        success: false,
        error: "This confirmation link has expired. Please request a new activation link.",
      };
    }

    // Try Supabase verification if active
    const supabase = getSupabaseClient();
    if (supabase && pending.otp) {
      try {
        await supabase.auth.verifyOtp({
          email: pending.email,
          token: pending.otp,
          type: "signup",
        });
      } catch {
        // Fallback to local below
      }
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: pending.name,
      email: pending.email,
      role: pending.role,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      currentUsers[pending.email] = {
        password: pending.password,
        user: newUser,
      };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(currentUsers));
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
      localStorage.removeItem(LOCAL_PENDING_KEY);
      window.dispatchEvent(new Event("mozart_auth_changed"));
    }

    setPendingSignUp(null);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const clearPendingSignUp = () => {
    setPendingSignUp(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_PENDING_KEY);
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }

    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_AUTH_KEY);
      window.dispatchEvent(new Event("mozart_auth_changed"));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        pendingSignUp,
        signIn,
        signUp,
        initiateSignUpWithOtp,
        verifySignUpOtp,
        confirmAccount,
        resendSignUpOtp,
        clearPendingSignUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
