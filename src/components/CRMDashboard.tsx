import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Student, Teacher, Assignment } from "./types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface CRMDashboardProps {
  students: Student[];
  teachers: Teacher[];
  assignments: Assignment[];
  onBack: () => void;
}

interface StudentWithStats extends Student {
  lessonsTotal: number;
  lessonsAttended: number;
  lessonsMissed: number;
  homeworkTotal: number;
  homeworkCompleted: number;
  homeworkLate: number;
  homeworkMissed: number;
  balance: number;
  nextLesson?: Date;
  teacher?: Teacher;
}

const CRMDashboard = ({ students, teachers, assignments, onBack }: CRMDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);

  const getStudentStats = (student: Student): StudentWithStats => {
    const studentAssignments = assignments.filter(a => a.studentId === student.id);
    const lessons = studentAssignments.filter(a => a.type === "lesson");
    const homework = studentAssignments.filter(a => a.type === "homework");

    const nextLesson = lessons
      .filter(l => l.status === "scheduled" && l.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    const teacher = teachers.find(t => t.id === student.teacherId);

    return {
      ...student,
      lessonsTotal: lessons.length,
      lessonsAttended: lessons.filter(l => l.status === "attended").length,
      lessonsMissed: lessons.filter(l => l.status === "missed").length,
      homeworkTotal: homework.length,
      homeworkCompleted: homework.filter(h => h.status === "completed").length,
      homeworkLate: homework.filter(h => h.status === "completed_late").length,
      homeworkMissed: homework.filter(h => h.status === "not_completed").length,
      balance: Math.floor(Math.random() * 10000) - 5000,
      nextLesson: nextLesson?.date,
      teacher
    };
  };

  const studentsWithStats = students
    .map(getStudentStats)
    .filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           s.login.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeacher = filterTeacher === "all" || s.teacherId === filterTeacher;
      return matchesSearch && matchesTeacher;
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-secondary">CRM-система</h1>
              <p className="text-muted-foreground">Управление учениками и занятиями</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Icon name="Users" size={18} className="mr-2" />
              {students.length} учеников
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Icon name="GraduationCap" size={18} className="mr-2" />
              {teachers.length} педагогов
            </Badge>
          </div>
        </div>

        {!selectedStudent ? (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по имени или логину..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value="all">Все педагоги</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentsWithStats.map((student) => (
                <Card
                  key={student.id}
                  className="p-5 shadow-md border-0 bg-white hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon name="User" size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-secondary">{student.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{student.login}</p>
                      </div>
                    </div>
                    <Badge variant={student.balance >= 0 ? "default" : "destructive"}>
                      {student.balance >= 0 ? "+" : ""}{student.balance} ₽
                    </Badge>
                  </div>

                  {student.teacher && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <Icon name="GraduationCap" size={16} />
                      <span>{student.teacher.fullName}</span>
                    </div>
                  )}

                  {student.nextLesson && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Icon name="Calendar" size={16} className="text-orange-500" />
                      <span className="text-muted-foreground">
                        Следующий урок: {format(student.nextLesson, "d MMMM, HH:mm", { locale: ru })}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Уроки</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-green-600">{student.lessonsAttended}</span>
                        <span className="text-xs text-muted-foreground">/ {student.lessonsTotal}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Домашки</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-green-600">{student.homeworkCompleted}</span>
                        <span className="text-xs text-muted-foreground">/ {student.homeworkTotal}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {studentsWithStats.length === 0 && (
              <Card className="p-12 text-center border-0 bg-white/60 backdrop-blur">
                <Icon name="Search" size={64} className="mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-semibold mb-2 text-secondary">Ничего не найдено</h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить параметры поиска
                </p>
              </Card>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedStudent(null)}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад к списку
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 shadow-lg border-0 bg-white lg:col-span-1">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="User" size={48} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-secondary">{selectedStudent.fullName}</h2>
                    <p className="text-muted-foreground">{selectedStudent.login}</p>
                  </div>
                  
                  {selectedStudent.teacher && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-1">Педагог</div>
                      <div className="flex items-center justify-center gap-2">
                        <Icon name="GraduationCap" size={18} className="text-purple-600" />
                        <span className="font-semibold">{selectedStudent.teacher.fullName}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Баланс</div>
                    <Badge 
                      variant={selectedStudent.balance >= 0 ? "default" : "destructive"}
                      className="text-xl px-4 py-2"
                    >
                      {selectedStudent.balance >= 0 ? "+" : ""}{selectedStudent.balance} ₽
                    </Badge>
                  </div>

                  {selectedStudent.nextLesson && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Следующий урок</div>
                      <div className="flex items-center justify-center gap-2 text-orange-600">
                        <Icon name="Calendar" size={18} />
                        <span className="font-semibold">
                          {format(selectedStudent.nextLesson, "d MMMM, HH:mm", { locale: ru })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-5 shadow-md border-0 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="CheckCircle" size={20} className="text-green-600" />
                      </div>
                      <h3 className="font-semibold text-secondary">Уроки</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Всего уроков:</span>
                        <span className="font-semibold">{selectedStudent.lessonsTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Посещено:</span>
                        <span className="font-semibold text-green-600">{selectedStudent.lessonsAttended}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Пропущено:</span>
                        <span className="font-semibold text-red-600">{selectedStudent.lessonsMissed}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Посещаемость:</span>
                          <span className="font-semibold text-blue-600">
                            {selectedStudent.lessonsTotal > 0 
                              ? Math.round((selectedStudent.lessonsAttended / selectedStudent.lessonsTotal) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5 shadow-md border-0 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon name="BookOpen" size={20} className="text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-secondary">Домашние задания</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Всего ДЗ:</span>
                        <span className="font-semibold">{selectedStudent.homeworkTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Выполнено:</span>
                        <span className="font-semibold text-green-600">{selectedStudent.homeworkCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">С опозданием:</span>
                        <span className="font-semibold text-yellow-600">{selectedStudent.homeworkLate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Не выполнено:</span>
                        <span className="font-semibold text-red-600">{selectedStudent.homeworkMissed}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6 shadow-lg border-0 bg-white">
                  <h3 className="font-semibold text-lg mb-4 text-secondary">История занятий</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {assignments
                      .filter(a => a.studentId === selectedStudent.id)
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .slice(0, 20)
                      .map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              assignment.type === "lesson" ? "bg-orange-100" : "bg-blue-100"
                            }`}>
                              <Icon 
                                name={assignment.type === "lesson" ? "Calendar" : "BookOpen"} 
                                size={16} 
                                className={assignment.type === "lesson" ? "text-orange-600" : "text-blue-600"}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{assignment.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(assignment.date, "d MMMM yyyy, HH:mm", { locale: ru })}
                              </div>
                            </div>
                          </div>
                          <Badge variant={
                            assignment.status === "attended" || assignment.status === "completed" ? "default" :
                            assignment.status === "missed" || assignment.status === "not_completed" ? "destructive" :
                            assignment.status === "completed_late" ? "secondary" : "outline"
                          }>
                            {assignment.status === "scheduled" && "Запланировано"}
                            {assignment.status === "attended" && "Посещено"}
                            {assignment.status === "missed" && "Пропущено"}
                            {assignment.status === "completed" && "Выполнено"}
                            {assignment.status === "completed_late" && "С опозданием"}
                            {assignment.status === "not_completed" && "Не выполнено"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMDashboard;
