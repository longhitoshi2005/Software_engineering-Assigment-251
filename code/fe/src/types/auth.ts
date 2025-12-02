/**
 * Authentication related types
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthError {
  detail: string;
}
