import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Student, Teacher, User } from "./types";
import AppHeader from "./AppHeader";
import AppNavigation from "./AppNavigation";
import UserManagement from "./UserManagement";
import AssignmentManager from "./AssignmentManager";
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
  const getStudentCount = (teacherId: string) => {
    return students.filter(s => s.teacherId === teacherId).length;
  };

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
