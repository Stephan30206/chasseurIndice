import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Users } from "lucide-react";

interface PlayerScore {
  name: string;
  role: string;
  score: number;
  correctAnswers: number;
  speedBonus: number;
  color: string;
  isCurrentPlayer?: boolean;
}

const Results = () => {
  const navigate = useNavigate();
  const [allPlayers, setAllPlayers] = useState<PlayerScore[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerScore | null>(null);

  useEffect(() => {
    // Récupérer les données du joueur actuel
    const score = localStorage.getItem("finalScore");
    const role = localStorage.getItem("playerRole");
    const correct = localStorage.getItem("correctAnswers");
    const bonus = localStorage.getItem("speedBonus");
    
    let currentPlayerData: PlayerScore | null = null;
    
    if (score && role) {
      const roleData = JSON.parse(role);
      currentPlayerData = {
        name: roleData.name,
        role: roleData.name,
        score: parseInt(score),
        correctAnswers: correct ? parseInt(correct) : 0,
        speedBonus: bonus ? parseInt(bonus) : 0,
        color: roleData.color,
        isCurrentPlayer: true
      };
      setCurrentPlayer(currentPlayerData);
    }

    // Récupérer tous les scores (incluant les autres joueurs de la salle d'attente)
    const waitingPlayers = localStorage.getItem("waitingPlayers");
    const allScores = localStorage.getItem("allPlayersScores");
    
    let playersData: PlayerScore[] = [];

    if (allScores) {
      // Si on a les scores de tous les joueurs
      playersData = JSON.parse(allScores);
    } else if (waitingPlayers) {
      // Sinon, générer des scores simulés basés sur les joueurs en attente
      const players = JSON.parse(waitingPlayers);
      playersData = players.map((player: any) => {
        const isCurrentUser = currentPlayerData && player.name === currentPlayerData.role;
        if (isCurrentUser && currentPlayerData) {
          return currentPlayerData;
        }
        // Générer des scores aléatoires pour la démo
        const correctAns = Math.floor(Math.random() * 6) + 5; // 5-10
        const speedBon = Math.floor(Math.random() * 30) + 10; // 10-40
        return {
          name: player.name,
          role: player.name,
          score: correctAns * 10 + speedBon,
          correctAnswers: correctAns,
          speedBonus: speedBon,
          color: player.color,
          isCurrentPlayer: false
        };
      });
    } else if (currentPlayerData) {
      // Si on n'a que le joueur actuel
      playersData = [currentPlayerData];
    }

    // Trier par score décroissant
    playersData.sort((a, b) => b.score - a.score);
    setAllPlayers(playersData);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 150) return "text-success";
    if (score >= 75) return "text-primary";
    return "text-destructive";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 150) return "bg-success/20 border-success";
    if (score >= 75) return "bg-primary/20 border-primary";
    return "bg-destructive/20 border-destructive";
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const handlePlayAgain = () => {
    localStorage.removeItem("finalScore");
    localStorage.removeItem("playerRole");
    localStorage.removeItem("waitingPlayers");
    localStorage.removeItem("correctAnswers");
    localStorage.removeItem("speedBonus");
    localStorage.removeItem("allPlayersScores");
    navigate("/");
  };

  const currentPlayerRank = allPlayers.findIndex(p => p.isCurrentPlayer) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="w-24 h-24 text-accent animate-pulse-glow" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Partie Terminée !
          </h1>
          <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            {allPlayers.length} joueur{allPlayers.length > 1 ? 's' : ''} - Classement Final
          </p>
        </div>

        {/* Score du joueur actuel (highlight) */}
        {currentPlayer && (
          <Card className={`p-6 border-4 ${getScoreBgColor(currentPlayer.score)} animate-slide-up shadow-2xl`}>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentPlayer.color} flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
                  {currentPlayer.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Votre Performance</p>
                  <p className="text-3xl font-bold">{currentPlayer.name}</p>
                  <p className="text-lg text-muted-foreground">
                    Classement: {getMedalEmoji(currentPlayerRank - 1)} {currentPlayerRank > 3 && `${currentPlayerRank}ème`}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xl text-muted-foreground">Votre Score</p>
                <p className={`text-6xl font-bold ${getScoreColor(currentPlayer.score)}`}>
                  {currentPlayer.score}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <Award className="w-8 h-8 mx-auto text-success mb-2" />
                  <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                  <p className="text-xl font-bold">{currentPlayer.correctAnswers}/10</p>
                </div>
                <div className="text-center">
                  <Medal className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Bonus rapidité</p>
                  <p className="text-xl font-bold">+{currentPlayer.speedBonus}</p>
                </div>
                <div className="text-center">
                  <Trophy className="w-8 h-8 mx-auto text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  <p className="text-xl font-bold">
                    {Math.round((currentPlayer.correctAnswers / 10) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Classement de tous les joueurs */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-accent" />
            Classement Général
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlayers.map((player, index) => (
              <Card
                key={index}
                className={`p-6 transition-all duration-300 hover:scale-105 ${
                  player.isCurrentPlayer 
                    ? 'border-4 border-accent shadow-xl' 
                    : 'border-2 border-border'
                } ${getScoreBgColor(player.score)}`}
              >
                {/* Badge de classement */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl font-bold">
                    {getMedalEmoji(index)}
                  </div>
                  {player.isCurrentPlayer && (
                    <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                      Vous
                    </div>
                  )}
                </div>

                {/* Avatar et nom */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-xl shadow-md`}
                  >
                    {player.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold truncate">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {index + 1}{index === 0 ? 'er' : 'ème'} place
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-center mb-4">
                  <p className={`text-4xl font-bold ${getScoreColor(player.score)}`}>
                    {player.score}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-background/50 rounded px-3 py-2">
                    <span className="text-muted-foreground">Réponses</span>
                    <span className="font-bold">{player.correctAnswers}/10</span>
                  </div>
                  <div className="flex justify-between items-center bg-background/50 rounded px-3 py-2">
                    <span className="text-muted-foreground">Bonus</span>
                    <span className="font-bold">+{player.speedBonus}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={handlePlayAgain}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform text-lg px-8 py-6"
          >
            Rejouer
          </Button>
        </div>

        {/* Note pour la démo */}
        <Card className="p-6 bg-muted/50 border-muted">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Note</strong> - Les scores des autres joueurs sont simulés pour la démo. 
              Avec un backend temps réel, tous les scores seraient synchronisés automatiquement.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Results;