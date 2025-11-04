import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Student, Teacher, Assignment, Payment } from "./types";
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"income" | "expense">("income");
  const [paymentComment, setPaymentComment] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const paymentsData = localStorage.getItem("lineaschool_payments");
    if (paymentsData) {
      const parsed = JSON.parse(paymentsData).map((p: any) => ({
        ...p,
        date: new Date(p.date)
      }));
      setPayments(parsed);
    }
  }, []);

  const savePayments = (newPayments: Payment[]) => {
    localStorage.setItem("lineaschool_payments", JSON.stringify(newPayments));
    setPayments(newPayments);
  };

  const getStudentBalance = (studentId: string): number => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    return studentPayments.reduce((sum, p) => {
      return sum + (p.type === "income" ? p.amount : -p.amount);
    }, 0);
  };

  const updateStudentBalance = (studentId: string, balance: number) => {
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) return;
    const users = JSON.parse(usersData);
    const updated = users.map((u: Student) => 
      u.id === studentId ? { ...u, balance } : u
    );
    localStorage.setItem("lineaschool_users", JSON.stringify(updated));
  };

  const getStudentStats = (student: Student): StudentWithStats => {
    const studentAssignments = assignments.filter(a => a.studentId === student.id);
    const lessons = studentAssignments.filter(a => a.type === "lesson");
    const homework = studentAssignments.filter(a => a.type === "homework");

    const nextLesson = lessons
      .filter(l => l.status === "scheduled" && l.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    const teacher = teachers.find(t => t.id === student.teacherId);
    const balance = getStudentBalance(student.id);

    return {
      ...student,
      lessonsTotal: lessons.length,
      lessonsAttended: lessons.filter(l => l.status === "attended").length,
      lessonsMissed: lessons.filter(l => l.status === "missed").length,
      homeworkTotal: homework.length,
      homeworkCompleted: homework.filter(h => h.status === "completed").length,
      homeworkLate: homework.filter(h => h.status === "completed_late").length,
      homeworkMissed: homework.filter(h => h.status === "not_completed").length,
      balance,
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

  const handleAddPayment = () => {
    if (!selectedStudent || !paymentAmount) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      amount: parseFloat(paymentAmount),
      date: new Date(),
      type: paymentType,
      comment: paymentComment,
      createdBy: "admin"
    };

    const updatedPayments = [...payments, newPayment];
    savePayments(updatedPayments);

    const newBalance = getStudentBalance(selectedStudent.id) + 
      (paymentType === "income" ? parseFloat(paymentAmount) : -parseFloat(paymentAmount));
    updateStudentBalance(selectedStudent.id, newBalance);

    setSelectedStudent({
      ...selectedStudent,
      balance: newBalance
    });

    setShowPaymentDialog(false);
    setPaymentAmount("");
    setPaymentComment("");
    setPaymentType("income");
  };

  const getStudentPayments = (studentId: string): Payment[] => {
    return payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

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
                    <div className="mt-3 space-y-2">
                      <Button 
                        onClick={() => setShowPaymentDialog(true)}
                        className="w-full"
                        size="sm"
                      >
                        <Icon name="Wallet" size={16} className="mr-2" />
                        Добавить платеж
                      </Button>
                    </div>
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
                  <h3 className="font-semibold text-lg mb-4 text-secondary">История платежей</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {getStudentPayments(selectedStudent.id).length > 0 ? (
                      getStudentPayments(selectedStudent.id).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              payment.type === "income" ? "bg-green-100" : "bg-red-100"
                            }`}>
                              <Icon 
                                name={payment.type === "income" ? "ArrowDownCircle" : "ArrowUpCircle"} 
                                size={16} 
                                className={payment.type === "income" ? "text-green-600" : "text-red-600"}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {payment.type === "income" ? "Пополнение" : "Списание"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(payment.date, "d MMMM yyyy, HH:mm", { locale: ru })}
                              </div>
                              {payment.comment && (
                                <div className="text-xs text-muted-foreground italic">{payment.comment}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant={payment.type === "income" ? "default" : "destructive"}>
                            {payment.type === "income" ? "+" : "-"}{payment.amount} ₽
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon name="Wallet" size={48} className="mx-auto mb-2 opacity-30" />
                        <p>Платежи отсутствуют</p>
                      </div>
                    )}
                  </div>
                </Card>

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

        {showPaymentDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Добавить платеж</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowPaymentDialog(false);
                    setPaymentAmount("");
                    setPaymentComment("");
                  }}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Тип операции</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={paymentType === "income" ? "default" : "outline"}
                      onClick={() => setPaymentType("income")}
                      className="w-full"
                    >
                      <Icon name="ArrowDownCircle" size={16} className="mr-2" />
                      Пополнение
                    </Button>
                    <Button
                      variant={paymentType === "expense" ? "destructive" : "outline"}
                      onClick={() => setPaymentType("expense")}
                      className="w-full"
                    >
                      <Icon name="ArrowUpCircle" size={16} className="mr-2" />
                      Списание
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Сумма (₽)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Введите сумму"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="comment">Комментарий</Label>
                  <Input
                    id="comment"
                    value={paymentComment}
                    onChange={(e) => setPaymentComment(e.target.value)}
                    placeholder="Например: Оплата за октябрь"
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleAddPayment}
                  disabled={!paymentAmount}
                  className="w-full"
                >
                  <Icon name="Check" size={16} className="mr-2" />
                  Добавить платеж
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMDashboard;
