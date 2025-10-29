import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

const StudentLogin = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/7a191c3e-5c96-4e00-b7c4-bb0f62c9fdc2?type=students`
      );
      
      if (!response.ok) throw new Error("Ошибка загрузки данных");
      
      const data = await response.json();
      
      const student = data.students?.find(
        (s: any) => s.phone === phone
      );

      if (student) {
        localStorage.setItem("studentId", student.id);
        localStorage.setItem("studentData", JSON.stringify(student));
        
        toast({
          title: "Вход выполнен",
          description: `Добро пожаловать, ${student.name}!`,
        });
        
        navigate("/cabinet");
      } else {
        toast({
          title: "Ошибка входа",
          description: "Ученик с таким телефоном не найден",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к системе",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-emerald-50/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="w-fit mb-2"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-[#0FA858] rounded-2xl flex items-center justify-center shadow-md">
              <Icon name="GraduationCap" size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Личный кабинет</CardTitle>
          <CardDescription className="text-center">
            Введите номер телефона для входа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
                className="text-lg"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#0FA858] hover:bg-[#0FA858]/90" 
              disabled={loading || !phone}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={16} className="mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;