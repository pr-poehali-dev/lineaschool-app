import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const LandingPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Ученик",
      description: "Просматривайте расписание, занятия и домашние задания",
      icon: "GraduationCap" as const,
      path: "/student-login",
      color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
    },
    {
      title: "Преподаватель",
      description: "Управляйте занятиями и отслеживайте прогресс учеников",
      icon: "BookOpen" as const,
      path: "/teacher-login",
      color: "bg-green-500/10 text-green-600 hover:bg-green-500/20"
    },
    {
      title: "Администратор",
      description: "Полный контроль над системой и пользователями",
      icon: "Settings" as const,
      path: "/admin-login",
      color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Добро пожаловать</h1>
          <p className="text-muted-foreground text-lg">Выберите тип входа для продолжения</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card 
              key={role.path}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(role.path)}
            >
              <CardHeader className="text-center">
                <div className={`w-20 h-20 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110`}>
                  <Icon name={role.icon} size={40} />
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <CardDescription className="mt-2">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Войти
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
