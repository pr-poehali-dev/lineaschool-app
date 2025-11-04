import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Student, Teacher, User } from "./types";
import AppHeader from "./AppHeader";
import AppNavigation from "./AppNavigation";
import UserManagement from "./UserManagement";
import AssignmentManager from "./AssignmentManager";
import CRMDashboard from "./CRMDashboard";
import { Assignment } from "./types";

interface AdminDashboardProps {
  user: User;
  students: Student[];
  teachers: Teacher[];
  onSelectStudent: (student: Student) => void;
  onLogout: () => void;
  activeTab: "calendar" | "homework" | "profile" | "admin";
  setActiveTab: (tab: "calendar" | "homework" | "profile" | "admin") => void;
  onAddStudent: (student: Student) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onAddAssignment: (assignment: Assignment) => void;
}

const AdminDashboard = ({
  user,
  students,
  teachers,
  onSelectStudent,
  onLogout,
  activeTab,
  setActiveTab,
  onAddStudent,
  onAddTeacher,
  onAddAssignment
}: AdminDashboardProps) => {
  const [showCRM, setShowCRM] = useState(false);
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [dbTeachers, setDbTeachers] = useState<any[]>([]);
  const [dbAssignments, setDbAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getStudentCount = (teacherId: string) => {
    return students.filter(s => s.teacherId === teacherId).length;
  };

  useEffect(() => {
    if (showCRM) {
      loadDataFromDB();
    }
  }, [showCRM]);

  const loadDataFromDB = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/649662ee-a259-46cb-a494-a090f9842573');
      const data = await response.json();
      
      console.log('Данные из БД:', data);
      
      setDbStudents(data.students || []);
      setDbTeachers(data.teachers || []);
      setDbAssignments(data.assignments || []);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllAssignments = (): Assignment[] => {
    const assignmentsData = localStorage.getItem("lineaschool_assignments_v7");
    if (!assignmentsData) return [];
    return JSON.parse(assignmentsData).map((a: any) => ({
      ...a,
      date: new Date(a.date)
    }));
  };

  if (showCRM) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mb-2">Загрузка данных</h2>
            <p className="text-muted-foreground">Получаем учеников из AlfaCRM...</p>
          </Card>
        </div>
      );
    }

    const crmStudents = dbStudents.map((s: any) => ({
      id: String(s.id),
      login: s.login || s.phone || '',
      fullName: s.fullName,
      role: 'student' as const,
      teacherId: s.teacherId ? String(s.teacherId) : undefined,
      balance: s.balance || 0,
      lessonsAttended: s.lessonsAttended || 0,
      lessonsMissed: s.lessonsMissed || 0,
      lessonsPaid: s.lessonsPaid || 0
    }));

    const crmTeachers = dbTeachers.map((t: any) => ({
      id: String(t.id),
      login: t.login || t.phone || '',
      fullName: t.fullName,
      role: 'teacher' as const
    }));
    
    console.log('CRM данные:', { 
      students: crmStudents.length, 
      teachers: crmTeachers.length, 
      assignments: dbAssignments.length 
    });
    
    return (
      <CRMDashboard
        students={crmStudents}
        teachers={crmTeachers}
        assignments={dbAssignments}
        onBack={() => setShowCRM(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto pb-20">
        <AppHeader
          user={user}
          selectedStudent={null}
          onLogout={onLogout}
        />

        {activeTab === "calendar" && (
          <div className="p-6 space-y-6">
            <div className="mb-4">
              <Button 
                onClick={() => setShowCRM(true)}
                className="w-full"
                size="lg"
              >
                <Icon name="LayoutDashboard" size={20} className="mr-2" />
                Открыть CRM-систему
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary">Педагоги</h2>
              <Button size="sm" onClick={() => setActiveTab("admin")}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            {teachers.length === 0 ? (
              <Card className="p-8 text-center border-0 bg-white/60 backdrop-blur">
                <Icon name="Users" size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Педагоги не добавлены</p>
                <Button onClick={() => setActiveTab("admin")}>
                  Добавить первого педагога
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <Card key={teacher.id} className="p-4 shadow-md border-0 bg-white hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Icon name="GraduationCap" size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary">{teacher.fullName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getStudentCount(teacher.id)} {getStudentCount(teacher.id) === 1 ? "ученик" : "учеников"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <h2 className="text-xl font-semibold text-secondary">Ученики</h2>
              <Button size="sm" onClick={() => setActiveTab("admin")}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            {students.length === 0 ? (
              <Card className="p-8 text-center border-0 bg-white/60 backdrop-blur">
                <Icon name="User" size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Ученики не добавлены</p>
                <Button onClick={() => setActiveTab("admin")}>
                  Добавить первого ученика
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const teacher = teachers.find(t => t.id === student.teacherId);
                  return (
                    <Card
                      key={student.id}
                      className="p-4 shadow-md border-0 bg-white hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => onSelectStudent(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Icon name="User" size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-secondary">{student.fullName}</h3>
                            {teacher && (
                              <p className="text-sm text-muted-foreground">
                                Педагог: {teacher.fullName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "homework" && (
          <AssignmentManager
            students={students}
            userId={user.id}
            onAddAssignment={onAddAssignment}
          />
        )}

        {activeTab === "admin" && (
          <UserManagement
            onAddStudent={onAddStudent}
            onAddTeacher={onAddTeacher}
            teachers={teachers}
          />
        )}

        {activeTab === "profile" && (
          <div className="p-6 space-y-6">
            <Card className="p-6 shadow-lg border-0 bg-white">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="Shield" size={40} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary">{user.fullName}</h3>
                  <Badge className="mt-2">Администратор</Badge>
                </div>
                <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Педагогов в системе:</span>
                    <span className="font-semibold text-secondary">{teachers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Учеников в системе:</span>
                    <span className="font-semibold text-secondary">{students.length}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <AppNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={true}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;