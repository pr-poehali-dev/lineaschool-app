import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Student, Teacher, Assignment, Payment } from "./types";
import StudentCard, { StudentWithStats } from "./CRM/StudentCard";
import PaymentDialog from "./CRM/PaymentDialog";
import StudentProfile from "./CRM/StudentProfile";
import StudentStats from "./CRM/StudentStats";
import PaymentHistory from "./CRM/PaymentHistory";
import AssignmentHistory from "./CRM/AssignmentHistory";
import ImportData from "./CRM/ImportData";

interface CRMDashboardProps {
  students: Student[];
  teachers: Teacher[];
  assignments: Assignment[];
  onBack: () => void;
}

const CRMDashboard = ({ students, teachers, assignments, onBack }: CRMDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"income" | "expense">("income");
  const [paymentComment, setPaymentComment] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleClosePaymentDialog = () => {
    setShowPaymentDialog(false);
    setPaymentAmount("");
    setPaymentComment("");
  };

  const getStudentPayments = (studentId: string): Payment[] => {
    return payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getStudentAssignments = (studentId: string): Assignment[] => {
    return assignments
      .filter(a => a.studentId === studentId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 20);
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              <Icon name="Upload" size={16} className="mr-2" />
              Импорт из AlfaCRM
            </Button>
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
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => setSelectedStudent(student)}
                />
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
              <StudentProfile
                student={selectedStudent}
                onAddPayment={() => setShowPaymentDialog(true)}
              />

              <div className="lg:col-span-2 space-y-6">
                <StudentStats student={selectedStudent} />
                <PaymentHistory payments={getStudentPayments(selectedStudent.id)} />
                <AssignmentHistory assignments={getStudentAssignments(selectedStudent.id)} />
              </div>
            </div>
          </div>
        )}

        <PaymentDialog
          isOpen={showPaymentDialog}
          paymentType={paymentType}
          paymentAmount={paymentAmount}
          paymentComment={paymentComment}
          onTypeChange={setPaymentType}
          onAmountChange={setPaymentAmount}
          onCommentChange={setPaymentComment}
          onSubmit={handleAddPayment}
          onClose={handleClosePaymentDialog}
        />

        {showImportDialog && (
          <ImportData
            onImportComplete={() => {
              setRefreshKey(prev => prev + 1);
              window.location.reload();
            }}
            onClose={() => setShowImportDialog(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CRMDashboard;