import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Book, Code, Globe, Megaphone, Briefcase, User } from "lucide-react";

const roles = [
  { id: "droit", name: "Droit", icon: GraduationCap, color: "from-blue-500 to-blue-600" },
  { id: "nurs", name: "Nurs", icon: Heart, color: "from-pink-500 to-pink-600" },
  { id: "theologie", name: "Théologie", icon: Book, color: "from-purple-500 to-purple-600" },
  { id: "informatique", name: "Informatique", icon: Code, color: "from-cyan-500 to-cyan-600" },
  { id: "anglais", name: "Langue Anglaise", icon: Globe, color: "from-green-500 to-green-600" },
  { id: "communication", name: "Communication", icon: Megaphone, color: "from-orange-500 to-orange-600" },
  { id: "gestion", name: "Gestion", icon: Briefcase, color: "from-yellow-500 to-yellow-600" },
  { id: "professeur", name: "Professeur", icon: User, color: "from-red-500 to-red-600" },
];

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    // Store role in localStorage
    const role = roles.find(r => r.id === roleId);
    if (role) {
      localStorage.setItem("playerRole", JSON.stringify(role));
      setTimeout(() => {
        navigate("/waiting-room");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">
            4 Images 1 Mot
          </h1>
          <p className="text-2xl text-muted-foreground">
            Sélectionnez votre rôle pour commencer
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br ${role.color} hover:scale-105 transition-all duration-300 border-2 border-primary/20 hover:border-primary hover:shadow-[0_0_30px_rgba(0,200,255,0.3)] ${
                  isSelected ? "scale-105 shadow-[0_0_30px_rgba(0,200,255,0.5)]" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="w-12 h-12" />
                <span className="text-lg font-semibold text-center px-2">
                  {role.name}
                </span>
              </Button>
            );
          })}
        </div>

        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            En attente de {8} joueurs pour commencer la partie
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
