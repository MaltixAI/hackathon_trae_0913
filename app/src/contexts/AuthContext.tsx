import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getUserProfile, createUserProfile, User as AppUser } from '../lib/supabase';
import { Alert } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, userData: Partial<AppUser>) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Try to load existing profile first
        const { data: existingProfile } = await getUserProfile(session.user.id);

        if (existingProfile) {
          setUserProfile(existingProfile);
          setLoading(false);
        } else if (session.user.email_confirmed_at) {
          // If user is confirmed but no profile exists, they might be signing in for the first time
          // after email verification - create a basic profile
          const basicProfile = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || 'Food Enthusiast',
            bio: 'Food enthusiast ready to explore!',
            food_tags: [],
            dietary_restrictions: [],
            preferred_cuisines: [],
          };

          const { data: newProfile } = await createUserProfile(session.user.id, basicProfile);
          if (newProfile) {
            setUserProfile(newProfile);
          }
          setLoading(false);
        } else {
          // User exists but not confirmed - set loading false but no profile
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId);
      if (error) {
        console.error('Error loading user profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<AppUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);

        // Only create profile if the user is confirmed (not pending email verification)
        if (data.user.email_confirmed_at) {
          // Create user profile in database
          const profileData = {
            id: data.user.id,
            email: data.user.email!,
            name: userData.name || '',
            age: userData.age,
            avatar: userData.avatar,
            bio: userData.bio,
            food_tags: userData.food_tags || [],
            dietary_restrictions: userData.dietary_restrictions || [],
            preferred_cuisines: userData.preferred_cuisines || [],
            location: userData.location,
          };

          const { data: profile, error: profileError } = await createUserProfile(data.user.id, profileData);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail the whole signup if profile creation fails
            console.log('Profile will be created when user confirms email');
          } else if (profile) {
            setUserProfile(profile);
          }
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'Failed to sign up';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        // Load user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'Failed to sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setUserProfile(data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    session,
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};