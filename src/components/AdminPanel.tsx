import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  login: string;
  password: string;
  fullName: string;
  role: string;
}

const AdminPanel = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    login: "",
    password: "",
    fullName: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const usersData = localStorage.getItem("lineaschool_users");
    const users = usersData ? JSON.parse(usersData) : [
      { id: "1", login: "admin", password: "admin123", fullName: "Администратор", role: "admin" }
    ];
    setStudents(users.filter((u: Student) => u.role === "student"));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const usersData = localStorage.getItem("lineaschool_users");
    const users = usersData ? JSON.parse(usersData) : [
      { id: "1", login: "admin", password: "admin123", fullName: "Администратор", role: "admin" }
    ];

    const existingUser = users.find((u: Student) => u.login === newStudent.login);
    if (existingUser) {
      toast({
        title: "Ошибка",
        description: "Пользователь с таким логином уже существует",
        variant: "destructive"
      });
      return;
    }

    const student: Student = {
      id: Date.now().toString(),
      login: newStudent.login,
      password: newStudent.password,
      fullName: newStudent.fullName,
      role: "student"
    };

    users.push(student);
    localStorage.setItem("lineaschool_users", JSON.stringify(users));

    toast({
      title: "Успешно",
      description: `Ученик ${newStudent.fullName} добавлен в систему`
    });

    setNewStudent({ login: "", password: "", fullName: "" });
    setShowForm(false);
    loadStudents();
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    setNewStudent({ ...newStudent, password });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary">Управление учениками</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Icon name={showForm ? "X" : "UserPlus"} size={18} className="mr-2" />
          {showForm ? "Отмена" : "Добавить ученика"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-0 shadow-lg bg-white">
          <h3 className="text-lg font-semibold text-secondary mb-4">Новый ученик</h3>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО ученика</Label>
              <Input
                id="fullName"
                type="text"
                value={newStudent.fullName}
                onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                value={newStudent.login}
                onChange={(e) => setNewStudent({ ...newStudent, login: e.target.value })}
                placeholder="ivanov_ivan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  placeholder="Введите пароль"
                  required
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  <Icon name="Shuffle" size={18} />
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Добавить ученика
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary">Список учеников</h3>
        {students.length === 0 ? (
          <Card className="p-8 text-center border-0 bg-white/60 backdrop-blur">
            <Icon name="Users" size={48} className="mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">Пока нет добавленных учеников</p>
          </Card>
        ) : (
          students.map((student) => (
            <Card key={student.id} className="p-5 border-0 shadow-md bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary">{student.fullName}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Логин: <span className="font-mono">{student.login}</span></span>
                      <span>Пароль: <span className="font-mono">{student.password}</span></span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Icon name="CheckCircle" size={14} className="mr-1" />
                  Активен
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
