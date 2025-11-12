import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award } from "lucide-react";

const Results = () => {
  const navigate = useNavigate();
  const [finalScore, setFinalScore] = useState(0);
  const [playerRole, setPlayerRole] = useState<any>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  useEffect(() => {
    const score = localStorage.getItem("finalScore");
    const role = localStorage.getItem("playerRole");
    const correct = localStorage.getItem("correctAnswers");
    const bonus = localStorage.getItem("speedBonus");
    
    if (score) setFinalScore(parseInt(score));
    if (role) setPlayerRole(JSON.parse(role));
    if (correct) setCorrectAnswers(parseInt(correct));
    if (bonus) setSpeedBonus(parseInt(bonus));
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

  const handlePlayAgain = () => {
    localStorage.removeItem("finalScore");
    localStorage.removeItem("playerRole");
    localStorage.removeItem("waitingPlayers");
    localStorage.removeItem("correctAnswers");
    localStorage.removeItem("speedBonus");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="w-24 h-24 text-accent animate-pulse-glow" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Partie Terminée !
          </h1>
        </div>

        <Card className={`p-8 border-2 ${getScoreBgColor(finalScore)} animate-slide-up`}>
          <div className="text-center space-y-6">
            {playerRole && (
              <div className="flex items-center justify-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${playerRole.color} flex items-center justify-center`}>
                  {playerRole.icon && <playerRole.icon.type className="w-8 h-8" />}
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Vous avez joué en tant que</p>
                  <p className="text-2xl font-bold">{playerRole.name}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xl text-muted-foreground">Score Final</p>
              <p className={`text-7xl font-bold ${getScoreColor(finalScore)}`}>
                {finalScore}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Award className="w-8 h-8 mx-auto text-success mb-2" />
                <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                <p className="text-xl font-bold">{correctAnswers}/10</p>
              </div>
              <div className="text-center">
                <Medal className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Bonus rapidité</p>
                <p className="text-xl font-bold">+{speedBonus}</p>
              </div>
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto text-accent mb-2" />
                <p className="text-sm text-muted-foreground">Classement</p>
                <p className="text-xl font-bold">1er</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={handlePlayAgain}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform text-lg px-8 py-6"
          >
            Rejouer
          </Button>
        </div>

        <Card className="p-6 bg-muted/50 border-muted">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Version Démo</strong> - Pour une expérience multijoueur complète avec tous les joueurs, le backend temps réel sera nécessaire.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Results;
