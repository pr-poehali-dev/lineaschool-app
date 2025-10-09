import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Student, Teacher } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserManagementProps {
  onAddStudent: (student: Student) => void;
  onAddTeacher: (teacher: Teacher) => void;
  teachers: Teacher[];
}

const UserManagement = ({ onAddStudent, onAddTeacher, teachers }: UserManagementProps) => {
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [fullName, setFullName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userType === "student") {
      const newStudent: Student = {
        id: Date.now().toString(),
        fullName,
        login,
        password,
        role: "student",
        teacherId: selectedTeacher || undefined
      };
      onAddStudent(newStudent);
    } else {
      const newTeacher: Teacher = {
        id: Date.now().toString(),
        fullName,
        login,
        password,
        role: "teacher"
      };
      onAddTeacher(newTeacher);
    }
    
    setFullName("");
    setLogin("");
    setPassword("");
    setSelectedTeacher("");
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-secondary">Управление пользователями</h2>
      
      <Card className="p-6 shadow-lg border-0 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Тип пользователя</Label>
            <Select value={userType} onValueChange={(v) => setUserType(v as "student" | "teacher")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Ученик</SelectItem>
                <SelectItem value="teacher">Педагог</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fullName">ФИО</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Введите полное имя"
              required
            />
          </div>

          <div>
            <Label htmlFor="login">Логин</Label>
            <Input
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          {userType === "student" && teachers.length > 0 && (
            <div>
              <Label>Педагог (необязательно)</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите педагога" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без педагога</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить {userType === "student" ? "ученика" : "педагога"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default UserManagement;
