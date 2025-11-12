import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Book, Code, Globe, Megaphone, Briefcase, User, Users, AlertCircle } from "lucide-react";

// Déclaration TypeScript pour le storage partagé Lovable
declare global {
  interface Window {
    storage?: {
      get: (key: string, shared?: boolean) => Promise<{ key: string; value: string; shared: boolean } | null>;
      set: (key: string, value: string, shared?: boolean) => Promise<{ key: string; value: string; shared: boolean } | null>;
      delete: (key: string, shared?: boolean) => Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list: (prefix?: string, shared?: boolean) => Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}

interface Player {
  id: string;
  name: string;
  icon: { name: string };
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

// Vérifier si le storage partagé est disponible
const hasSharedStorage = () => {
  return typeof window !== 'undefined' && 
         window.storage !== undefined && 
         typeof window.storage.set === 'function';
};

const WaitingRoom = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(false);

  // Vérifier la disponibilité du storage avec retry
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;

    const checkStorage = () => {
      if (hasSharedStorage()) {
        console.log('✅ Storage partagé détecté !');
        setStorageAvailable(true);
        return true;
      }
      return false;
    };

    // Vérification immédiate
    if (checkStorage()) return;

    // Retry avec délai croissant
    const retryInterval = setInterval(() => {
      retryCount++;
      console.log(`Tentative ${retryCount}/${maxRetries} de détection du storage...`);
      
      if (checkStorage() || retryCount >= maxRetries) {
        clearInterval(retryInterval);
        if (!hasSharedStorage()) {
          console.warn('⚠️ Storage partagé non disponible après', maxRetries, 'tentatives');
          setStorageAvailable(false);
        }
      }
    }, 1000);

    return () => clearInterval(retryInterval);
  }, []);

  // Initialiser le joueur actuel
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        // Récupérer le rôle depuis localStorage
        const playerRole = localStorage.getItem("playerRole");
        if (!playerRole) {
          setIsLoading(false);
          return;
        }

        const role = JSON.parse(playerRole);
        const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const playerData: Player = {
          ...role,
          id: playerId,
          timestamp: Date.now()
        };

        setCurrentPlayer(playerData);

        // Si storage disponible, ajouter le joueur
        if (hasSharedStorage() && window.storage) {
          try {
            await window.storage.set(
              `player:${playerId}`,
              JSON.stringify(playerData),
              true
            );
            console.log('✅ Joueur ajouté au storage partagé');
          } catch (err) {
            console.error('❌ Erreur lors de l\'ajout au storage:', err);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        setIsLoading(false);
      }
    };

    // Attendre que le storage soit vérifié
    if (storageAvailable !== null) {
      initializePlayer();
    }
  }, [storageAvailable]);

  // Charger tous les joueurs
  const loadPlayers = async () => {
    if (!hasSharedStorage() || !window.storage) return;

    try {
      const result = await window.storage.list('player:', true);
      if (!result || !result.keys) {
        setPlayers(currentPlayer ? [currentPlayer] : []);
        return;
      }

      const now = Date.now();
      const playerList: Player[] = [];

      for (const key of result.keys) {
        try {
          const data = await window.storage.get(key, true);
          if (data && data.value) {
            const player = JSON.parse(data.value);
            
            // Supprimer les joueurs inactifs (> 45 secondes)
            if (now - player.timestamp > 45000) {
              await window.storage.delete(key, true);
            } else {
              playerList.push(player);
            }
          }
        } catch (err) {
          console.error('Erreur lors du chargement du joueur:', err);
        }
      }

      // Trier par ordre d'arrivée
      playerList.sort((a, b) => a.timestamp - b.timestamp);
      setPlayers(playerList);
    } catch (error) {
      console.error("Erreur lors du chargement des joueurs:", error);
      // Fallback: afficher au moins le joueur actuel
      if (currentPlayer) {
        setPlayers([currentPlayer]);
      }
    }
  };

  // Rafraîchir la liste des joueurs toutes les 2 secondes
  useEffect(() => {
    if (!currentPlayer) return;

    if (hasSharedStorage()) {
      loadPlayers();
      const interval = setInterval(loadPlayers, 2000);
      return () => clearInterval(interval);
    } else {
      // Mode local: afficher uniquement le joueur actuel
      setPlayers([currentPlayer]);
    }
  }, [currentPlayer, storageAvailable]);

  // Mettre à jour la présence du joueur toutes les 15 secondes
  useEffect(() => {
    if (!currentPlayer || !hasSharedStorage() || !window.storage) return;

    const updatePresence = async () => {
      try {
        await window.storage!.set(
          `player:${currentPlayer.id}`,
          JSON.stringify({
            ...currentPlayer,
            timestamp: Date.now()
          }),
          true
        );
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
      }
    };

    const interval = setInterval(updatePresence, 15000);
    return () => clearInterval(interval);
  }, [currentPlayer, storageAvailable]);

  // Nettoyer quand le joueur quitte
  useEffect(() => {
    return () => {
      if (currentPlayer && hasSharedStorage() && window.storage) {
        window.storage.delete(`player:${currentPlayer.id}`, true).catch(console.error);
      }
    };
  }, [currentPlayer]);

  const handleStartGame = () => {
    localStorage.setItem("gamePlayers", JSON.stringify(players));
    alert("Lancement du jeu avec " + players.length + " joueurs !");
  };

  const handleLeave = () => {
    if (currentPlayer && hasSharedStorage() && window.storage) {
      window.storage.delete(`player:${currentPlayer.id}`, true).catch(console.error);
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

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <Card className="p-8 max-w-md w-full bg-red-900/50 border-red-500">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-200 mb-4 text-center">Erreur</h2>
          <p className="text-red-100 mb-6 text-center">Aucun rôle sélectionné.</p>
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
          
          {storageAvailable ? (
            <div className="inline-block px-4 py-2 bg-green-500/20 rounded-full border border-green-500">
              <p className="text-sm text-green-300 flex items-center gap-2 justify-center">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Mode multijoueur en temps réel
              </p>
            </div>
          ) : (
            <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-full border border-yellow-500">
              <p className="text-sm text-yellow-300 flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4" />
                Mode solo (storage partagé non disponible)
              </p>
            </div>
          )}
        </div>

        {/* Grille des joueurs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => {
            const player = players[index];
            
            if (player) {
              const Icon = iconMap[player.icon.name] || User;
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
        {currentPlayer && (
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

              {players.length >= 2 && storageAvailable && (
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-transform text-lg px-8"
                >
                  Commencer le Jeu ({players.length} joueurs)
                </Button>
              )}

              {players.length >= 1 && !storageAvailable && (
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 transition-transform text-lg px-8"
                >
                  Commencer en Solo
                </Button>
              )}
            </div>

            {players.length < 2 && storageAvailable && (
              <div className="text-white/70">
                <p>En attente d'au moins 2 joueurs pour commencer...</p>
                <p className="text-sm mt-2">
                  Partagez le lien avec d'autres joueurs pour les inviter !
                </p>
              </div>
            )}
          </div>
        )}

        {/* Informations */}
        <div className="text-center text-xs text-white/50 space-y-2">
          {storageAvailable ? (
            <>
              <p>💡 Ouvrez cette page sur plusieurs appareils pour jouer ensemble</p>
              <p>🔄 La liste se rafraîchit automatiquement toutes les 2 secondes</p>
              <p>⏱️ Les joueurs inactifs depuis 45 secondes sont automatiquement retirés</p>
            </>
          ) : (
            <>
              <p>⚠️ Mode développement local détecté</p>
              <p>🚀 Déployez sur Lovable.app pour le mode multijoueur</p>
              <p>📱 URL actuelle: {window.location.href}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;