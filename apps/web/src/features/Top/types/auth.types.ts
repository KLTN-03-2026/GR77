export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
}

export interface AuthError {
  message: string;
}
