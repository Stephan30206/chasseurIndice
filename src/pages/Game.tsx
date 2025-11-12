import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy } from "lucide-react";
import { toast } from "sonner";

// Sample question data
const questions = [
  {
    id: 1,
    images: [
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
    ],
    answer: "ORDINATEUR",
    letters: "ORDINATEURMPS",
  },
  {
    id: 2,
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    ],
    answer: "LIVRE",
    letters: "LIVREBCDFGH",
  },
  {
    id: 3,
    images: [
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    ],
    answer: "NATURE",
    letters: "NATUREPQRST",
  },
  {
    id: 4,
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    ],
    answer: "MODE",
    letters: "MODEFGHIJK",
  },
  {
    id: 5,
    images: [
      "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    ],
    answer: "CUISINE",
    letters: "CUISINEPQRT",
  },
  {
    id: 6,
    images: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    ],
    answer: "SPORT",
    letters: "SPORTABCDE",
  },
  {
    id: 7,
    images: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    ],
    answer: "MUSIQUE",
    letters: "MUSIQUEPQRS",
  },
  {
    id: 8,
    images: [
      "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    ],
    answer: "HOMME",
    letters: "HOMMEPQRSTU",
  },
  {
    id: 9,
    images: [
      "https://images.unsplash.com/photo-1560439513-74b037a25d84?w=400",
      "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=400",
      "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=400",
    ],
    answer: "VOYAGE",
    letters: "VOYAGEPQRST",
  },
  {
    id: 10,
    images: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400",
    ],
    answer: "TRAVAIL",
    letters: "TRAVAILPQRS",
  },
];

const Game = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const question = questions[currentQuestion];

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleNextQuestion();
    }
  }, [timeLeft, isAnswered]);

  const handleLetterClick = (letter: string) => {
    if (!isAnswered && userAnswer.length < question.answer.length) {
      setUserAnswer(userAnswer + letter);
    }
  };

  const handleDelete = () => {
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const handleValidate = () => {
    if (userAnswer.length === 0) return;

    setIsAnswered(true);
    setShowFeedback(true);

    if (userAnswer === question.answer) {
      const points = timeLeft < 40 ? 130 : 100; // Bonus rapidité
      const newScore = score + points;
      const newCorrectAnswers = correctAnswers + 1;
      const newSpeedBonus = timeLeft < 40 ? speedBonus + 30 : speedBonus;
      
      setScore(newScore);
      setCorrectAnswers(newCorrectAnswers);
      setSpeedBonus(newSpeedBonus);
      
      toast.success(`+${points} points!`, {
        description: timeLeft < 40 ? "Bonus rapidité +30!" : "Bonne réponse!",
        duration: 2000,
      });

      // Save to localStorage immediately
      if (currentQuestion === questions.length - 1) {
        localStorage.setItem("finalScore", newScore.toString());
        localStorage.setItem("correctAnswers", newCorrectAnswers.toString());
        localStorage.setItem("speedBonus", newSpeedBonus.toString());
      }
    } else {
      const newScore = Math.max(0, score - 25);
      setScore(newScore);
      
      toast.error("-25 points", {
        description: "Mauvaise réponse",
        duration: 2000,
      });

      // Save to localStorage immediately
      if (currentQuestion === questions.length - 1) {
        localStorage.setItem("finalScore", newScore.toString());
        localStorage.setItem("correctAnswers", correctAnswers.toString());
        localStorage.setItem("speedBonus", speedBonus.toString());
      }
    }

    setTimeout(() => {
      setShowFeedback(false);
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setTimeLeft(60);
    } else {
      navigate("/results");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Card className="px-6 py-3 bg-card border-primary/30 flex items-center gap-4">
            <Trophy className="w-6 h-6 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold text-primary">{score}</p>
            </div>
          </Card>

          <Card className="px-6 py-3 bg-card border-primary/30">
            <div className="flex items-center gap-4">
              <Timer className={`w-6 h-6 ${timeLeft < 10 ? "text-destructive" : "text-primary"}`} />
              <div>
                <p className="text-sm text-muted-foreground">Temps restant</p>
                <p className={`text-2xl font-bold ${timeLeft < 10 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                  {timeLeft}s
                </p>
              </div>
            </div>
          </Card>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Question</p>
            <p className="text-2xl font-bold text-primary">
              {currentQuestion + 1} / {questions.length}
            </p>
          </div>
        </div>

        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />

        {/* Main Game Area */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            {question.images.map((image, index) => (
              <Card
                key={index}
                className="overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </Card>
            ))}
          </div>

          {/* Answer Area */}
          <div className="space-y-6">
            {/* Answer Display */}
            <Card className={`p-8 border-2 transition-all duration-300 ${
              showFeedback
                ? userAnswer === question.answer
                  ? "border-success bg-success/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                  : "border-destructive bg-destructive/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                : "border-primary/30"
            }`}>
              <div className="flex gap-2 justify-center flex-wrap">
                {Array.from({ length: question.answer.length }).map((_, index) => (
                  <div
                    key={index}
                    className="w-12 h-16 border-2 border-primary rounded-lg flex items-center justify-center bg-secondary text-2xl font-bold"
                  >
                    {userAnswer[index] || ""}
                  </div>
                ))}
              </div>
            </Card>

            {/* Keyboard */}
            <div className="grid grid-cols-7 gap-2">
              {question.letters.split("").map((letter, index) => (
                <Button
                  key={index}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isAnswered}
                  variant="secondary"
                  className="h-12 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {letter}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleDelete}
                disabled={isAnswered || userAnswer.length === 0}
                variant="outline"
                className="flex-1 h-14 text-lg border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Effacer
              </Button>
              <Button
                onClick={handleValidate}
                disabled={isAnswered || userAnswer.length === 0}
                className={`flex-1 h-14 text-lg border-2 transition-all ${
                  userAnswer.length === question.answer.length
                    ? "bg-gradient-to-r from-primary to-accent border-primary hover:scale-105 animate-pulse-glow"
                    : "bg-muted border-muted text-muted-foreground"
                }`}
              >
                Valider
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
