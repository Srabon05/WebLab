export type UserRole = 'admin' | 'recycling_center' | 'collector' | 'user' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
}

// Mock authentication state
let currentUser: User | null = null;

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@ewaste.com',
    name: 'System Admin',
    role: 'admin',
    phone: '+1-555-0100',
  },
  {
    id: '2',
    email: 'center@ewaste.com',
    name: 'GreenTech Recycling Center',
    role: 'recycling_center',
    phone: '+1-555-0101',
    address: '123 Green St, EcoCity',
  },
  {
    id: '3',
    email: 'collector@ewaste.com',
    name: 'John Collector',
    role: 'collector',
    phone: '+1-555-0102',
  },
  {
    id: '4',
    email: 'user@ewaste.com',
    name: 'Jane Smith',
    role: 'user',
    phone: '+1-555-0103',
    address: '456 Main St, Apt 2B, EcoCity',
  },
];

export const login = (email: string, password: string): User | null => {
  // Simple mock login - in production, this would verify password
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  return null;
};

export const register = (email: string, name: string, role: UserRole, phone?: string, address?: string): User | null => {
  const newUser: User = {
    id: String(mockUsers.length + 1),
    email,
    name,
    role,
    phone,
    address,
  };
  mockUsers.push(newUser);
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  return newUser;
};

export const logout = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
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
  return getCurrentUser() !== null;
};

export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};
