import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<{ error: any }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const passwordHash = await hashPassword(password);

      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { error: { message: 'User with this email already exists' } };
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          full_name: fullName || null,
        })
        .select()
        .single();

      if (error) throw error;

      const userSession: User = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        is_admin: data.is_admin,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      localStorage.setItem('user', JSON.stringify(userSession));
      setUser(userSession);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const passwordHash = await hashPassword(password);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { error: { message: 'Invalid email or password' } };
      }

      const userSession: User = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        is_admin: data.is_admin,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      localStorage.setItem('user', JSON.stringify(userSession));
      setUser(userSession);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to sign in' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (fullName: string) => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      const { data, error } = await supabase
        .from('users')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser: User = {
        ...user,
        full_name: data.full_name,
        updated_at: data.updated_at,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to update profile' } };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      const currentPasswordHash = await hashPassword(currentPassword);

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (userData.password_hash !== currentPasswordHash) {
        return { error: { message: 'Current password is incorrect' } };
      }

      const newPasswordHash = await hashPassword(newPassword);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to update password' } };
    }
  };

  const isAdmin = user?.is_admin ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
