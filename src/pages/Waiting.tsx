import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Book, Code, Globe, Megaphone, Briefcase, User } from "lucide-react";

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);

  useEffect(() => {
    // Get current player from localStorage
    const playerRole = localStorage.getItem("playerRole");
    if (playerRole) {
      const player = JSON.parse(playerRole);
      setCurrentPlayer(player);
      
      // Simulate adding player to waiting room
      // In real implementation, this would be via WebSocket
      const storedPlayers = localStorage.getItem("waitingPlayers");
      const existingPlayers = storedPlayers ? JSON.parse(storedPlayers) : [];
      
      // Check if player already exists
      if (!existingPlayers.find((p: any) => p.id === player.id)) {
        const updatedPlayers = [...existingPlayers, player];
        localStorage.setItem("waitingPlayers", JSON.stringify(updatedPlayers));
        setPlayers(updatedPlayers);
      } else {
        setPlayers(existingPlayers);
      }
    }
  }, []);

  const getPlayerIcon = (player: any) => {
    // Map role names to icons
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

  const handleStartGame = () => {
    navigate("/game");
  };

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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => {
            const player = players[index];
            
            if (player) {
              const Icon = getPlayerIcon(player);
              
              return (
                <Card
                  key={index}
                  className={`h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br ${player.color} border-2 border-primary/50 hover:border-primary transition-all animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
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
                  Commencer le Jeu (Demo)
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Mode démo : commence avec {players.length} joueurs
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;