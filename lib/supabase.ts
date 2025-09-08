import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          preferences: {
            language: 'english' | 'hindi';
            theme: 'light' | 'dark';
          };
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          preferences?: {
            language?: 'english' | 'hindi';
            theme?: 'light' | 'dark';
          };
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          preferences?: {
            language?: 'english' | 'hindi';
            theme?: 'light' | 'dark';
          };
          created_at?: string;
        };
      };
      translation_logs: {
        Row: {
          id: string;
          user_id: string;
          input_text: string;
          output_text: string;
          direction: 'isl_to_english' | 'english_to_isl' | 'isl_to_hindi' | 'hindi_to_isl';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_text: string;
          output_text: string;
          direction: 'isl_to_english' | 'english_to_isl' | 'isl_to_hindi' | 'hindi_to_isl';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          input_text?: string;
          output_text?: string;
          direction?: 'isl_to_english' | 'english_to_isl' | 'isl_to_hindi' | 'hindi_to_isl';
          created_at?: string;
        };
      };
      sos_alerts: {
        Row: {
          id: string;
          user_id: string;
          location: string;
          status: 'pending' | 'resolved' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location?: string;
          status?: 'pending' | 'resolved' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location?: string;
          status?: 'pending' | 'resolved' | 'cancelled';
          created_at?: string;
        };
      };
    };
  };
};