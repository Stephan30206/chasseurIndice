import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Timer, Trophy, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

// Mock players data
const mockPlayers = [
  { id: 1, name: "Droit", color: "from-red-500 to-red-700", score: 450, answered: false },
  { id: 2, name: "Nurs", color: "from-pink-500 to-pink-700", score: 380, answered: false },
  { id: 3, name: "Théologie", color: "from-purple-500 to-purple-700", score: 520, answered: true },
  { id: 4, name: "Informatique", color: "from-blue-500 to-blue-700", score: 600, answered: true },
  { id: 5, name: "Langue Anglaise", color: "from-green-500 to-green-700", score: 410, answered: false },
  { id: 6, name: "Communication", color: "from-yellow-500 to-yellow-700", score: 490, answered: true },
  { id: 7, name: "Gestion", color: "from-orange-500 to-orange-700", score: 350, answered: false },
  { id: 8, name: "Professeur", color: "from-teal-500 to-teal-700", score: 470, answered: false },
];

const PublicDisplay = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [players, setPlayers] = useState(mockPlayers);

  const question = questions[currentQuestion];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto advance to next question
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setTimeLeft(60);
          // Reset answered status
          setPlayers(players.map(p => ({ ...p, answered: false })));
        }
      }, 3000);
    }
  }, [timeLeft, currentQuestion]);

  const leftPlayers = players.slice(0, 4);
  const rightPlayers = players.slice(4, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary p-4">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
            4 Images 1 Mot
          </h1>
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-lg border-2 border-primary/30">
              <Timer className={`w-8 h-8 ${timeLeft < 10 ? "text-destructive" : "text-primary"}`} />
              <div>
                <p className="text-sm text-muted-foreground">Temps restant</p>
                <p className={`text-3xl font-bold ${timeLeft < 10 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                  {timeLeft}s
                </p>
              </div>
            </div>
            <div className="bg-card px-6 py-3 rounded-lg border-2 border-primary/30">
              <p className="text-sm text-muted-foreground">Question</p>
              <p className="text-3xl font-bold text-primary">
                {currentQuestion + 1} / {questions.length}
              </p>
            </div>
          </div>
        </div>

        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-3 mb-6" />

        {/* Main Layout: Players + Question */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Players */}
          <div className="col-span-2 space-y-3">
            {leftPlayers.map((player, index) => (
              <Card
                key={player.id}
                className={`p-4 border-2 transition-all duration-300 ${
                  player.answered
                    ? "border-success bg-success/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    : "border-primary/30"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {player.name.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-center line-clamp-2">{player.name}</p>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-accent" />
                    <p className="text-lg font-bold text-primary">{player.score}</p>
                  </div>
                  {player.answered && (
                    <Award className="w-5 h-5 text-success animate-pulse-glow" />
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Center: Question Area */}
          <div className="col-span-8 space-y-4">
            {/* Images */}
            <div className="grid grid-cols-3 gap-4">
              {question.images.map((image, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                </Card>
              ))}
            </div>

            {/* Answer Display */}
            <Card className="p-8 border-2 border-primary/30 bg-card">
              <div className="flex gap-3 justify-center flex-wrap">
                {Array.from({ length: question.answer.length }).map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-20 border-2 border-primary rounded-lg flex items-center justify-center bg-secondary text-3xl font-bold shadow-lg"
                  >
                    <span className="text-muted-foreground">_</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Keyboard */}
            <div className="grid grid-cols-13 gap-2">
              {question.letters.split("").map((letter, index) => (
                <div
                  key={index}
                  className="h-14 bg-secondary border-2 border-primary/30 rounded-lg flex items-center justify-center text-xl font-semibold shadow-md"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>

          {/* Right Players */}
          <div className="col-span-2 space-y-3">
            {rightPlayers.map((player, index) => (
              <Card
                key={player.id}
                className={`p-4 border-2 transition-all duration-300 ${
                  player.answered
                    ? "border-success bg-success/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    : "border-primary/30"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {player.name.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-center line-clamp-2">{player.name}</p>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-accent" />
                    <p className="text-lg font-bold text-primary">{player.score}</p>
                  </div>
                  {player.answered && (
                    <Award className="w-5 h-5 text-success animate-pulse-glow" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 text-center">
          <Card className="inline-block p-4 bg-muted/50 border-muted">
            <p className="text-sm text-muted-foreground">
              📺 <strong>Écran Public</strong> - Les joueurs répondent sur leurs propres appareils
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicDisplay;
