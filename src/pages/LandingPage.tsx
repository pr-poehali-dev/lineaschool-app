import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="flex items-center justify-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Icon name="Sparkles" size={24} className="text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">LineaSchool</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать</h1>
          <p className="text-muted-foreground">Выберите тип входа</p>
        </div>

        <div className="space-y-4">
          <Card 
            className="hover:shadow-xl transition-all cursor-pointer group border-2 border-primary/20"
            onClick={() => navigate("/student-login")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110">
                <Icon name="GraduationCap" size={48} className="text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Вход для ученика</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full h-12 text-base" size="lg">
                Войти
                <Icon name="ArrowRight" size={18} className="ml-2" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-green-500/5"
              onClick={() => navigate("/teacher-login")}
            >
              <Icon name="BookOpen" size={24} className="text-green-600" />
              <span className="text-sm font-medium">Преподаватель</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 hover:bg-purple-500/5"
              onClick={() => navigate("/admin-login")}
            >
              <Icon name="Settings" size={24} className="text-purple-600" />
              <span className="text-sm font-medium">Администратор</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;