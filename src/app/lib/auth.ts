export type UserRole = 'admin' | 'recycling_center' | 'collector' | 'user' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approval_status?: 'pending' | 'approved' | 'rejected';
  phone?: string;
  address?: string;
  avatar?: string;
}

import { loginRequest, logoutRequest, registerRequest } from "./api";

// Cached authentication state
let currentUser: User | null = null;

export const login = async (email: string, password: string): Promise<User> => {
  const user = (await loginRequest(email, password)) as User;
  currentUser = user;
  return user;
};

export const register = async (
  email: string,
  name: string,
  role: UserRole,
  phone?: string,
  address?: string,
  password?: string
): Promise<{ user: User; message?: string }> => {
  const data = await registerRequest({
    email,
    password: password || "password123",
    name,
    role,
    phone,
    address,
  });
  
  if (data.user && data.user.approval_status !== "pending") {
    currentUser = data.user as User;
  }
  
  return { user: data.user as User, message: data.message };
};

export const logout = async () => {
  currentUser = null;
  await logoutRequest();
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null && !!localStorage.getItem("accessToken");
};

export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};
