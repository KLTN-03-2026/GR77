import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/constants/endpoints";
import { VerifyOtpPayload, RegisterPayload } from "../types/auth.types";

export const authService = {
  async register(payload: RegisterPayload) {
    try {
      const res = await apiClient(ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");
      return data;
    } catch (err: any) {
      throw new Error(err.message || "Registration failed.");
    }
  },

  async verifyEmail(payload: VerifyOtpPayload) {
    try {
      const res = await apiClient(ENDPOINTS.AUTH.VERIFY_EMAIL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired verification code.");
      return data;
    } catch (err: any) {
      throw new Error(err.message || "Verification failed.");
    }
  },

  async resendVerification(email: string) {
    try {
      const res = await apiClient(ENDPOINTS.AUTH.RESEND_VERIFICATION, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend email.");
      return data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to resend email.");
    }
  }
};
