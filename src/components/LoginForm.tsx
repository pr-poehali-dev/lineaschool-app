import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

interface LoginFormProps {
  onLogin: (user: { id: string; login: string; fullName: string; role: string }) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const usersData = localStorage.getItem("lineaschool_users");
    const users = usersData ? JSON.parse(usersData) : [
      { id: "1", login: "admin", password: "admin123", fullName: "Администратор", role: "admin" }
    ];

    const user = users.find((u: any) => u.login === login && u.password === password);

    setTimeout(() => {
      if (user) {
        onLogin({
          id: user.id,
          login: user.login,
          fullName: user.fullName,
          role: user.role
        });
      } else {
        setError("Неверный логин или пароль");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-xl border-0 bg-white/90 backdrop-blur">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Icon name="BookOpen" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">LineaSchool</h1>
          <p className="text-muted-foreground">Вход в личный кабинет</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Логин</Label>
            <Input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              className="h-12"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Для входа используйте данные,</p>
          <p>предоставленные администратором</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
