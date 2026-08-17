export type AppView = "landing" | "auth" | "app";

export type AuthMode = "signin" | "signup";

export interface UserProfile {
  name: string;
  email: string;
  role: "patient" | "family" | "enterprise";
  plan: string;
  avatar?: string;
}

export type AppTab =
  | "dashboard" | "claims" | "auditor" | "ocr"
  | "copilot" | "sla" | "reports" | "policies" | "settings";

