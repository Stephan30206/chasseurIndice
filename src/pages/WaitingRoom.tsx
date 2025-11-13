import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Book, Code, Globe, Megaphone, Briefcase, User, Users, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface Player {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  timestamp: number;
}

const iconMap: Record<string, any> = {
  GraduationCap,
  Heart,
  Book,
  Code,
  Globe,
  Megaphone,
  Briefcase,
  User,
};

const WaitingRoom = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier la connexion Supabase
  useEffect(() => {
    if (!supabase) {
      setError("❌ Supabase non configuré. Vérifiez vos variables d'environnement.");
      setIsLoading(false);
      return;
    }

    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('players').select('count').limit(1);
        if (error) throw error;
        setIsConnected(true);
        console.log('✅ Connecté à Supabase !');
      } catch (err: any) {
        console.error('❌ Erreur connexion Supabase:', err);
        setError(`Erreur de connexion: ${err.message}`);
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  // Initialiser le joueur actuel
  useEffect(() => {
    const initializePlayer = async () => {
      if (!supabase || !isConnected) {
        setIsLoading(false);
        return;
      }

      try {
        const playerRole = localStorage.getItem("playerRole");
        if (!playerRole) {
          setError("Aucun rôle sélectionné");
          setIsLoading(false);
          return;
        }

        const role = JSON.parse(playerRole);
        const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const playerData: Player = {
          id: playerId,
          name: role.name,
          icon_name: role.icon.name,
          color: role.color,
          timestamp: Date.now()
        };

        // Ajouter le joueur à Supabase
        const { error: insertError } = await supabase
          .from('players')
          .insert(playerData);

        if (insertError) throw insertError;

        setCurrentPlayer(playerData);
        console.log('✅ Joueur ajouté:', playerData.name);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Erreur initialisation:", err);
        setError(`Erreur: ${err.message}`);
        setIsLoading(false);
      }
    };

    if (isConnected) {
      initializePlayer();
    }
  }, [isConnected]);

  // Charger les joueurs actifs
  const loadPlayers = async () => {
    if (!supabase) return;

    try {
      const cutoff = Date.now() - 45000; // 45 secondes

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .gte('timestamp', cutoff)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setPlayers(data || []);
    } catch (err: any) {
      console.error("Erreur chargement:", err);
    }
  };

  // S'abonner aux changements en temps réel
  useEffect(() => {
    if (!supabase || !currentPlayer) return;

    // Chargement initial
    loadPlayers();

    // Abonnement aux changements
    const channel = supabase
      .channel('players-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        () => {
          console.log('🔄 Changement détecté, rechargement...');
          loadPlayers();
        }
      )
      .subscribe();

    console.log('👂 Écoute des changements en temps réel...');

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPlayer]);

  // Mettre à jour la présence toutes les 15 secondes
  useEffect(() => {
    if (!supabase || !currentPlayer) return;

    const updatePresence = async () => {
      try {
        const { error } = await supabase
          .from('players')
          .update({ timestamp: Date.now() })
          .eq('id', currentPlayer.id);

        if (error) throw error;
        console.log('💓 Présence mise à jour');
      } catch (err: any) {
        console.error('Erreur mise à jour présence:', err);
      }
    };

    const interval = setInterval(updatePresence, 15000);
    return () => clearInterval(interval);
  }, [currentPlayer]);

  // Nettoyer les joueurs inactifs toutes les 30 secondes
  useEffect(() => {
    if (!supabase) return;

    const cleanup = async () => {
      const cutoff = Date.now() - 45000;
      await supabase
        .from('players')
        .delete()
        .lt('timestamp', cutoff);
    };

    const interval = setInterval(cleanup, 30000);
    return () => clearInterval(interval);
  }, []);

  // Nettoyer à la fermeture
  useEffect(() => {
    return () => {
      if (supabase && currentPlayer) {
        supabase
          .from('players')
          .delete()
          .eq('id', currentPlayer.id)
          .then(() => console.log('🧹 Joueur supprimé'));
      }
    };
  }, [currentPlayer]);

  const handleStartGame = () => {
    localStorage.setItem("gamePlayers", JSON.stringify(players));
    window.location.href = "/game";
  };

  const handleLeave = async () => {
    if (supabase && currentPlayer) {
      await supabase
        .from('players')
        .delete()
        .eq('id', currentPlayer.id);
    }
    localStorage.removeItem("playerRole");
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-xl text-white">Connexion à la salle...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <Card className="p-8 max-w-md w-full bg-red-900/50 border-red-500">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-200 mb-4 text-center">Erreur</h2>
          <p className="text-red-100 mb-6 text-center">{error || "Une erreur est survenue"}</p>
          <Button onClick={() => window.location.href = "/"} className="w-full">
            Retour à la sélection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Salle d'Attente
          </h1>
          <div className="flex items-center justify-center gap-2 text-white text-xl">
            <Users className="w-6 h-6" />
            <span>{players.length} / 8 joueurs connectés</span>
          </div>
          
          <div className={`inline-block px-4 py-2 rounded-full border ${
            isConnected 
              ? 'bg-green-500/20 border-green-500' 
              : 'bg-red-500/20 border-red-500'
          }`}>
            <p className={`text-sm flex items-center gap-2 justify-center ${
              isConnected ? 'text-green-300' : 'text-red-300'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Multijoueur en temps réel activé
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  Déconnecté
                </>
              )}
            </p>
          </div>
        </div>

        {/* Grille des joueurs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => {
            const player = players[index];
            
            if (player) {
              const Icon = iconMap[player.icon_name] || User;
              const isCurrentPlayer = currentPlayer?.id === player.id;
              
              return (
                <Card
                  key={player.id}
                  className={`h-32 md:h-40 flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${player.color} border-2 relative transition-all ${
                    isCurrentPlayer 
                      ? 'border-yellow-400 ring-4 ring-yellow-400/50 scale-105' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {isCurrentPlayer && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                      VOUS
                    </div>
                  )}
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  <span className="text-sm md:text-lg font-semibold text-center px-2 text-white">
                    {player.name}
                  </span>
                </Card>
              );
            }
            
            return (
              <Card
                key={index}
                className="h-32 md:h-40 flex items-center justify-center border-2 border-dashed border-white/20 bg-white/5"
              >
                <span className="text-white/50 text-sm">En attente...</span>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Card className="inline-block px-6 py-3 bg-white/10 border-white/20 backdrop-blur">
            <p className="text-white text-lg">
              Vous jouez en tant que{" "}
              <span className="font-bold text-yellow-400">{currentPlayer.name}</span>
            </p>
          </Card>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={handleLeave}
              variant="outline"
              size="lg"
              className="bg-red-500/20 border-red-500 text-red-200 hover:bg-red-500/30"
            >
              Quitter la Salle
            </Button>

            {players.length >= 2 && (
              <Button
                onClick={handleStartGame}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-transform text-lg px-8"
              >
                Commencer le Jeu ({players.length} joueurs)
              </Button>
            )}
          </div>

          {players.length < 2 && (
            <div className="text-white/70">
              <p>En attente d'au moins 2 joueurs pour commencer...</p>
              <p className="text-sm mt-2">
                📱 Partagez le lien avec d'autres appareils pour les inviter !
              </p>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="text-center text-xs text-white/50 space-y-2">
          <p>🔄 Synchronisation automatique en temps réel</p>
          <p>📱 Testez sur PC + téléphone simultanément</p>
          <p>⏱️ Joueurs inactifs  45s automatiquement retirés</p>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;