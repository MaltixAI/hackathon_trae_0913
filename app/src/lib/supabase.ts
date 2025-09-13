import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkywmkuruwmsefpjxlbo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreXdta3VydXdtc2VmcGp4bGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTc3ODMsImV4cCI6MjA3MzM3Mzc4M30.EcT_X4vj6ozDAPZUAJ_lKW5Ua0zEzwzDia2TAyQW6K8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  avatar?: string;
  bio?: string;
  food_tags: string[];
  dietary_restrictions: string[];
  preferred_cuisines: string[];
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price_range: string;
  address: string;
  phone?: string;
  image_url?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  available_slots: TimeSlot[];
  created_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
}

export interface Reservation {
  id: string;
  user_id: string;
  restaurant_id: string;
  companion_id?: string;
  date: string;
  time: string;
  party_size: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  special_requests?: string;
  confirmation_code: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'declined';
  counter_sign: {
    user1_sign: string;
    user2_sign: string;
    category: string;
    source: string;
    instructions: string;
  };
  compatibility_score: number;
  common_interests: string[];
  created_at: string;
  expires_at: string;
}

export interface FoodPreference {
  id: string;
  user_id: string;
  food_item: string;
  preference: 'like' | 'dislike' | 'love' | 'hate';
  tags: string[];
  created_at: string;
}

// Auth helpers
export const signUp = async (email: string, password: string, userData: Partial<User>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database helpers
export const createUserProfile = async (userId: string, profile: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: userId, ...profile }])
    .select()
    .single();
  return { data, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const saveFoodPreference = async (preference: Omit<FoodPreference, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('food_preferences')
    .insert([preference])
    .select()
    .single();
  return { data, error };
};

export const getUserFoodPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('food_preferences')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const findCompatibleUsers = async (userId: string, foodTags: string[], location?: { latitude: number; longitude: number }) => {
  // This would be a more complex query in a real app
  // For now, we'll return mock data
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .neq('id', userId)
    .limit(10);
  return { data, error };
};

export const createMatch = async (match: Omit<Match, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('matches')
    .insert([match])
    .select()
    .single();
  return { data, error };
};

export const getUserMatches = async (userId: string) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:users!matches_user1_id_fkey(*),
      user2:users!matches_user2_id_fkey(*)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservation])
    .select()
    .single();
  return { data, error };
};

export const getUserReservations = async (userId: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      restaurant:restaurants(*),
      companion:users!reservations_companion_id_fkey(*)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: true });
  return { data, error };
};

export const searchRestaurants = async (query: string, location?: { latitude: number; longitude: number }) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10);
  return { data, error };
};