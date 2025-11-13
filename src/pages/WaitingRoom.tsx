import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Book, Code, Globe, Megaphone, Briefcase, User } from "lucide-react";

// Helper pour vérifier si window.storage existe (en production sur Lovable)
const hasSharedStorage = () => {
  return typeof window !== 'undefined' && 'storage' in window;
};

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPlayerIcon = (player: any) => {
    const roleIconMap: Record<string, any> = {
      "Droit": GraduationCap,
      "Nurs": Heart,
      "Théologie": Book,
      "Informatique": Code,
      "Langue Anglaise": Globe,
      "Communication": Megaphone,
      "Gestion": Briefcase,
      "Professeur": User,
    };
    return roleIconMap[player.name] || User;
  };

  // Initialiser le joueur actuel
  useEffect(() => {
    const initializePlayer = async () => {
      const playerRole = localStorage.getItem("playerRole");
      if (!playerRole) {
        navigate("/");
        return;
      }

      const player = JSON.parse(playerRole);
      
      // Générer un ID unique pour ce joueur
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const playerData = {
        ...player,
        id: playerId,
        timestamp: Date.now()
      };

      setCurrentPlayer(playerData);

      try {
        if (hasSharedStorage()) {
          // Mode production : utiliser window.storage pour la sync multi-utilisateurs
          await (window as any).storage.set(
            `player:${playerId}`,
            JSON.stringify(playerData),
            true // shared = visible par tous
          );
        } else {
          // Mode développement : utiliser localStorage
          const storedPlayers = localStorage.getItem("waitingPlayers");
          const existingPlayers = storedPlayers ? JSON.parse(storedPlayers) : [];
          
          if (!existingPlayers.find((p: any) => p.id === playerId)) {
            const updatedPlayers = [...existingPlayers, playerData];
            localStorage.setItem("waitingPlayers", JSON.stringify(updatedPlayers));
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du joueur:", error);
      }

      setIsLoading(false);
    };

    initializePlayer();
  }, [navigate]);

  // Charger tous les joueurs connectés
  const loadPlayers = async () => {
    try {
      if (hasSharedStorage()) {
        // Mode production : récupérer tous les joueurs depuis window.storage
        const result = await (window as any).storage.list('player:', true);
        if (!result) return;

        const now = Date.now();
        const playerList: any[] = [];

        for (const key of result.keys) {
          try {
            const data = await (window as any).storage.get(key, true);
            if (data) {
              const player = JSON.parse(data.value);
              
              // Supprimer les joueurs inactifs (> 45 secondes)
              if (now - player.timestamp > 45000) {
                await (window as any).storage.delete(key, true);
              } else {
                playerList.push(player);
              }
            }
          } catch (err) {
            console.error('Erreur lors du chargement du joueur:', err);
          }
        }

        // Trier par timestamp pour un ordre cohérent
        playerList.sort((a, b) => a.timestamp - b.timestamp);
        setPlayers(playerList);
      } else {
        // Mode développement : utiliser localStorage
        const storedPlayers = localStorage.getItem("waitingPlayers");
        const existingPlayers = storedPlayers ? JSON.parse(storedPlayers) : [];
        setPlayers(existingPlayers);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des joueurs:", error);
    }
  };

  // Rafraîchir la liste des joueurs toutes les 2 secondes
  useEffect(() => {
    if (!currentPlayer) return;

    loadPlayers();
    const interval = setInterval(loadPlayers, 2000);

    return () => clearInterval(interval);
  }, [currentPlayer]);

  // Mettre à jour la présence du joueur toutes les 15 secondes
  useEffect(() => {
    if (!currentPlayer || !hasSharedStorage()) return;

    const updatePresence = async () => {
      try {
        await (window as any).storage.set(
          `player:${currentPlayer.id}`,
          JSON.stringify({
            ...currentPlayer,
            timestamp: Date.now()
          }),
          true
        );
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la présence:', error);
      }
    };

    const interval = setInterval(updatePresence, 15000);
    return () => clearInterval(interval);
  }, [currentPlayer]);

  // Nettoyer quand le joueur quitte la page
  useEffect(() => {
    return () => {
      if (currentPlayer && hasSharedStorage()) {
        (window as any).storage.delete(`player:${currentPlayer.id}`, true).catch(console.error);
      }
    };
  }, [currentPlayer]);

  const handleStartGame = () => {
    // Sauvegarder la liste des joueurs pour la partie
    localStorage.setItem("gamePlayers", JSON.stringify(players));
    navigate("/game");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl text-muted-foreground">Connexion à la salle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Salle d'Attente
          </h1>
          <p className="text-xl text-muted-foreground">
            {players.length} / 8 joueurs connectés
          </p>
          
          {/* Indicateur de mode */}
          {hasSharedStorage() ? (
            <div className="inline-block px-4 py-2 bg-green-500/20 rounded-full border border-green-500">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2 justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Multijoueur en temps réel
              </p>
            </div>
          ) : (
            <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-full border border-yellow-500">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Mode local (développement)
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => {
            const player = players[index];
            
            if (player) {
              const Icon = getPlayerIcon(player);
              const isCurrentPlayer = currentPlayer?.id === player.id;
              
              return (
                <Card
                  key={player.id}
                  className={`h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br ${player.color} border-2 transition-all animate-slide-up relative ${
                    isCurrentPlayer 
                      ? 'border-yellow-400 ring-4 ring-yellow-400/50' 
                      : 'border-primary/50 hover:border-primary'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {isCurrentPlayer && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      VOUS
                    </div>
                  )}
                  <Icon className="w-12 h-12" />
                  <span className="text-lg font-semibold text-center px-2">
                    {player.name}
                  </span>
                </Card>
              );
            }
            
            return (
              <Card
                key={index}
                className="h-40 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted bg-card/50"
              >
                <User className="w-8 h-8 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">En attente...</span>
              </Card>
            );
          })}
        </div>

        {currentPlayer && (
          <div className="text-center space-y-4">
            <Card className="inline-block px-8 py-4 bg-primary/10 border-primary">
              <p className="text-lg">
                Vous jouez en tant que{" "}
                <span className="font-bold text-primary">{currentPlayer.name}</span>
              </p>
            </Card>

            {players.length >= 2 && (
              <div>
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform text-lg px-8 py-6"
                >
                  Commencer le Jeu ({players.length} joueurs)
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {hasSharedStorage() 
                    ? "Partie multijoueur avec les joueurs connectés" 
                    : `Mode démo : commence avec ${players.length} joueurs`}
                </p>
              </div>
            )}

            {players.length < 2 && (
              <div className="text-muted-foreground space-y-2">
                <p>En attente d'au moins 2 joueurs pour commencer...</p>
                {hasSharedStorage() && (
                  <p className="text-sm">
                    📱 Partagez ce lien avec vos amis pour les inviter !
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {hasSharedStorage() && (
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>💡 Ouvrez cette page sur plusieurs appareils pour voir la synchronisation</p>
            <p>🔄 Mise à jour automatique toutes les 2 secondes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;