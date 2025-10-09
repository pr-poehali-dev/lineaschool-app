import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Student } from "./types";

interface AdminDashboardProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddStudent: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: "calendar" | "homework" | "profile" | "admin") => void;
}

const AdminDashboard = ({
  students,
  onSelectStudent,
  onAddStudent,
  onLogout,
  activeTab,
  setActiveTab
}: AdminDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-md mx-auto pb-20">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="px-6 pt-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon name="BookOpen" size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-600">LineaSchool</h1>
                  <p className="text-sm text-muted-foreground">Панель администратора</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <Icon name="LogOut" size={20} className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary">Мои ученики</h2>
            <Button onClick={onAddStudent}>
              <Icon name="UserPlus" size={18} className="mr-2" />
              Добавить
            </Button>
          </div>

          {students.length === 0 ? (
            <Card className="p-8 text-center border-0 bg-white/60 backdrop-blur">
              <Icon name="Users" size={48} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">Пока нет добавленных учеников</p>
              <Button onClick={onAddStudent}>
                Добавить первого ученика
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className="p-5 border-0 shadow-md bg-white hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => onSelectStudent(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={28} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-secondary">{student.fullName}</h4>
                        <p className="text-sm text-muted-foreground">Нажмите для просмотра расписания</p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={24} className="text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab("calendar")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  "text-primary"
                )}
              >
                <Icon name="Users" size={24} />
                <span className="text-xs font-medium">Ученики</span>
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeTab === "admin" ? "text-primary" : "text-gray-400"
                )}
              >
                <Icon name="Settings" size={24} />
                <span className="text-xs font-medium">Управление</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminDashboard;
