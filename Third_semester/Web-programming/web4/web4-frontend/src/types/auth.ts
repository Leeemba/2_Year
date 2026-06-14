export interface User {
  uid: number;
  username: string;
  password?: string;
}

export interface AuthRequest {
  action: string;
  login: string;
  pswd: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}
