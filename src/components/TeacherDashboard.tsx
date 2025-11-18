import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Student, User, Assignment } from "./types";
import AppHeader from "./AppHeader";
import AppNavigation from "./AppNavigation";
import AssignmentManager from "./AssignmentManager";
import { useNavigate } from "react-router-dom";

interface TeacherDashboardProps {
  user: User;
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onLogout: () => void;
  activeTab: "calendar" | "homework" | "profile" | "admin" | "games";
  setActiveTab: (tab: "calendar" | "homework" | "profile" | "admin" | "games") => void;
  onAddAssignment: (assignment: Assignment) => void;
}

const TeacherDashboard = ({
  user,
  students,
  onSelectStudent,
  onLogout,
  activeTab,
  setActiveTab,
  onAddAssignment
}: TeacherDashboardProps) => {
  const navigate = useNavigate();

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
              <h2 className="text-xl font-semibold text-secondary">Мои ученики</h2>
            </div>

            {students.length === 0 ? (
              <Card className="p-8 text-center border-0 bg-white/60 backdrop-blur">
                <Icon name="Users" size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">Пока нет учеников</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
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
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                    </div>
                  </Card>
                ))}
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

        {activeTab === "games" && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-secondary mb-4">Игры</h2>
            
            <Card 
              className="p-4 shadow-md border-0 bg-white hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate('/game/filword')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Icon name="Grid3x3" size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Филворд</h3>
                    <p className="text-sm text-muted-foreground">Поиск слов на поле</p>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
              </div>
            </Card>

            <Card 
              className="p-4 shadow-md border-0 bg-white hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate('/game/doodle-jump')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-green-400 rounded-lg flex items-center justify-center text-2xl">
                    🦘
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Doodle Jump</h3>
                    <p className="text-sm text-muted-foreground">Прыгай по платформам</p>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
              </div>
            </Card>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="p-6 space-y-6">
            <Card className="p-6 shadow-lg border-0 bg-white">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="GraduationCap" size={40} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary">{user.fullName}</h3>
                  <Badge className="mt-2 bg-purple-100 text-purple-700">Педагог</Badge>
                </div>
                <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Учеников:</span>
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
          isAdmin={false}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;