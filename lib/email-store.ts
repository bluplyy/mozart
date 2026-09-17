export interface DispatchedEmail {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  code: string;
  sentAt: string;
  htmlContent: string;
  isRead?: boolean;
}

const STORAGE_KEY = "mozart_dispatched_emails_v1";

export function getDispatchedEmails(): DispatchedEmail[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return [];
}

export function saveDispatchedEmail(email: DispatchedEmail) {
  if (typeof window !== "undefined") {
    const existing = getDispatchedEmails();
    const updated = [email, ...existing.filter((e) => e.id !== email.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 20))); // Keep last 20
  }
}
