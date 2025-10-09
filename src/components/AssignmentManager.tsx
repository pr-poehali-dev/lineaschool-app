import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { Assignment, Student } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignmentManagerProps {
  students: Student[];
  userId: string;
  onAddAssignment: (assignment: Assignment) => void;
}

const AssignmentManager = ({ students, userId, onAddAssignment }: AssignmentManagerProps) => {
  const [assignmentType, setAssignmentType] = useState<"lesson" | "homework">("homework");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      title,
      subject,
      date: new Date(date),
      type: assignmentType,
      dueTime: time || undefined,
      description: description || undefined,
      completed: false,
      createdBy: userId
    };
    
    onAddAssignment(newAssignment);
    
    setTitle("");
    setSubject("");
    setDescription("");
    setDate("");
    setTime("");
    setSelectedStudent("");
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-secondary">
        Добавить {assignmentType === "lesson" ? "урок" : "домашнее задание"}
      </h2>
      
      <Card className="p-6 shadow-lg border-0 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Тип задания</Label>
            <Select value={assignmentType} onValueChange={(v) => setAssignmentType(v as "lesson" | "homework")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homework">Домашнее задание</SelectItem>
                <SelectItem value="lesson">Урок в расписании</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ученик</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ученика" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={assignmentType === "lesson" ? "Например: Алгебра" : "Например: Решить задачи 1-10"}
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Предмет</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Математика, Русский язык и т.д."
              required
            />
          </div>

          {assignmentType === "homework" && (
            <div>
              <Label htmlFor="description">Описание задания</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание задания"
                className="min-h-[100px]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="time">Время (необязательно)</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!selectedStudent}>
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить {assignmentType === "lesson" ? "урок" : "задание"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AssignmentManager;
