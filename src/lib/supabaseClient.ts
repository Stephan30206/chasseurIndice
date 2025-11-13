// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (hardcodée)
// Note: La clé 'anon' est publique et conçue pour être exposée côté client
const SUPABASE_URL = 'https://gshifqtrwgkujfwqlhqy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaGlmcXRyd2drdWpmd3FsaHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzEyODEsImV4cCI6MjA1MjM0NzI4MX0.tmlXQofpkMbvY';

// Fallback sur les variables d'environnement si disponibles
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:');
console.log('- URL:', supabaseUrl);
console.log('- Key présente:', !!supabaseKey);
console.log('- Source:', import.meta.env.VITE_SUPABASE_URL ? 'env variables' : 'hardcoded');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

export type { Player } from './types';

// Vérifier la connexion
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('players').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connecté !');
    return true;
  } catch (err) {
    console.error('❌ Erreur Supabase:', err);
    return false;
  }
};