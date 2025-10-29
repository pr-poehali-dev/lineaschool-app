import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

const AdminLogin = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const syncStudents = async () => {
    setSyncing(true);
    
    try {
      const response = await fetch(
        'https://functions.poehali.dev/7ef3480a-587f-492d-a8fa-27a1c0056429',
        { method: 'POST' }
      );
      
      if (!response.ok) throw new Error('Sync failed');
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Синхронизация завершена",
          description: `Синхронизировано: ${data.synced}, Пропущено: ${data.skipped}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка синхронизации",
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usersData = localStorage.getItem("lineaschool_users");
      if (!usersData) {
        throw new Error("Данные пользователей не найдены");
      }

      const users = JSON.parse(usersData);
      const admin = users.find(
        (u: any) => u.login === login && u.password === password && u.role === "admin"
      );

      if (admin) {
        localStorage.setItem("lineaschool_current_user", JSON.stringify(admin));
        toast({
          title: "Вход выполнен",
          description: `Добро пожаловать, ${admin.fullName}!`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверный логин или пароль",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось войти в систему",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
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
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Icon name="Settings" size={32} className="text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Вход для администратора</CardTitle>
          <CardDescription className="text-center">
            Введите логин и пароль для доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="admin"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
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
          
          <div className="mt-6 pt-6 border-t">
            <Button 
              onClick={syncStudents}
              disabled={syncing}
              variant="outline"
              className="w-full"
            >
              {syncing ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" size={16} className="mr-2" />
                  Синхронизировать учеников
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;