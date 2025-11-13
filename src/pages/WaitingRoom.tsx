import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Book, Code, Globe, Megaphone, Briefcase, User, Users, AlertCircle, Wifi } from "lucide-react";
import { supabase, checkSupabaseConnection } from "@/lib/supabaseClient";
import type { Player } from "@/lib/types";

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
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier la connexion Supabase
  useEffect(() => {
    const init = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError("Impossible de se connecter à Supabase");
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  // Initialiser le joueur actuel
  useEffect(() => {
    const initializePlayer = async () => {
      if (!isConnected) return;

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

        console.log('➕ Ajout joueur:', playerData.name);

        const { error: insertError } = await supabase
          .from('players')
          .insert(playerData);

        if (insertError) throw insertError;

        setCurrentPlayer(playerData);
        console.log('✅ Joueur ajouté');
        setIsLoading(false);
      } catch (err: any) {
        console.error("❌ Erreur:", err);
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
    try {
      // Charger TOUS les joueurs d'abord (pour debug)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      console.log('📊 Total joueurs en DB:', data?.length || 0);
      console.log('👥 Liste:', data?.map(p => p.name));

      // Filtrer les joueurs actifs (moins de 60 secondes)
      const now = Date.now();
      const activePlayers = (data || []).filter(p => {
        const age = now - p.timestamp;
        const isActive = age < 60000; // 60 secondes
        console.log(`   ${p.name}: ${Math.floor(age/1000)}s - ${isActive ? '✅' : '❌'}`);
        return isActive;
      });

      setPlayers(activePlayers);
      console.log('✅ Joueurs actifs:', activePlayers.length);
    } catch (err: any) {
      console.error("❌ Erreur chargement:", err);
    }
  };

  // S'abonner aux changements en temps réel
  useEffect(() => {
    if (!currentPlayer) return;

    console.log('👂 Activation temps réel');
    loadPlayers();

    const channel = supabase
      .channel('players-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        (payload) => {
          console.log('🔄 Changement:', payload.eventType);
          loadPlayers();
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPlayer]);

  // Mettre à jour la présence toutes les 15 secondes
  useEffect(() => {
    if (!currentPlayer) return;

    const updatePresence = async () => {
      try {
        await supabase
          .from('players')
          .update({ timestamp: Date.now() })
          .eq('id', currentPlayer.id);
        console.log('💓 Présence OK');
      } catch (err) {
        console.error('❌ Erreur présence:', err);
      }
    };

    const interval = setInterval(updatePresence, 15000);
    return () => clearInterval(interval);
  }, [currentPlayer]);

  // Nettoyer les joueurs inactifs (60 secondes au lieu de 45)
  useEffect(() => {
    const cleanup = async () => {
      const cutoff = Date.now() - 60000;
      const { error } = await supabase
        .from('players')
        .delete()
        .lt('timestamp', cutoff);
      
      if (!error) {
        console.log('🧹 Nettoyage effectué');
        loadPlayers(); // Recharger après nettoyage
      }
    };

    const interval = setInterval(cleanup, 30000);
    return () => clearInterval(interval);
  }, []);

  // Nettoyer à la fermeture
  useEffect(() => {
    return () => {
      if (currentPlayer) {
        supabase
          .from('players')
          .delete()
          .eq('id', currentPlayer.id)
          .then(() => console.log('🧹 Nettoyé'));
      }
    };
  }, [currentPlayer]);

  const handleStartGame = () => {
    navigate("/game");
  };

  const handleLeave = async () => {
    if (currentPlayer) {
      await supabase
        .from('players')
        .delete()
        .eq('id', currentPlayer.id);
    }
    localStorage.removeItem("playerRole");
    navigate("/");
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
          <Button onClick={() => navigate("/")} className="w-full">
            Retour à la sélection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Salle d'Attente
          </h1>
          <div className="flex items-center justify-center gap-2 text-white text-xl">
            <Users className="w-6 h-6" />
            <span>{players.length} / 8 joueurs connectés</span>
          </div>
          
          <div className="inline-block px-4 py-2 rounded-full border bg-green-500/20 border-green-500">
            <p className="text-sm flex items-center gap-2 justify-center text-green-300">
              <Wifi className="w-4 h-4" />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Multijoueur en temps réel
            </p>
          </div>
        </div>

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
              <p>En attente d'au moins 2 joueurs...</p>
              <p className="text-sm mt-2">
                📱 Partagez le lien avec d'autres appareils !
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-white/50 space-y-2">
          <p>🔄 Synchronisation automatique en temps réel</p>
          <p>📱 Testez sur PC + téléphone simultanément</p>
          <p>⏱️ Joueurs inactifs  60s automatiquement retirés</p>
          
          {/* Bouton de debug */}
          <button
            onClick={() => {
              console.log('🔄 Rechargement manuel...');
              loadPlayers();
            }}
            className="mt-2 px-4 py-2 bg-blue-500/20 border border-blue-500 rounded text-blue-300 hover:bg-blue-500/30 text-xs"
          >
            🔄 Recharger manuellement
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;