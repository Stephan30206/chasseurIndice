// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Player {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  timestamp: number;
}

// Fonctions utilitaires
export const playersService = {
  // Ajouter un joueur
  async addPlayer(player: Omit<Player, 'timestamp'>) {
    const { data, error } = await supabase
      .from('players')
      .insert({
        ...player,
        timestamp: Date.now()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer tous les joueurs actifs
  async getActivePlayers() {
    const cutoff = Date.now() - 45000; // 45 secondes

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .gte('timestamp', cutoff)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Mettre à jour la présence d'un joueur
  async updatePresence(playerId: string) {
    const { error } = await supabase
      .from('players')
      .update({ timestamp: Date.now() })
      .eq('id', playerId);

    if (error) throw error;
  },

  // Supprimer un joueur
  async removePlayer(playerId: string) {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) throw error;
  },

  // S'abonner aux changements en temps réel
  subscribeToPlayers(callback: (players: Player[]) => void) {
    const channel = supabase
      .channel('players-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        async () => {
          // Recharger les joueurs à chaque changement
          const players = await this.getActivePlayers();
          callback(players);
        }
      )
      .subscribe();

    return channel;
  },

  // Nettoyer les joueurs inactifs
  async cleanupInactive() {
    const cutoff = Date.now() - 45000;

    const { error } = await supabase
      .from('players')
      .delete()
      .lt('timestamp', cutoff);

    if (error) console.error('Erreur nettoyage:', error);
  }
};