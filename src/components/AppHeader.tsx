import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, Student } from "./types";

interface AppHeaderProps {
  user: User;
  selectedStudent: Student | null;
  onBack?: () => void;
  onLogout: () => void;
}

const AppHeader = ({ user, selectedStudent, onBack, onLogout }: AppHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {selectedStudent && user?.role === "admin" && onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
            )}
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shrink-0">
              <Icon name="BookOpen" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">LineaSchool</h1>
              <p className="text-sm text-muted-foreground">
                {selectedStudent ? selectedStudent.fullName : user?.role === "admin" ? "Панель администратора" : "Личный кабинет ученика"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!selectedStudent && (
              <div className="text-right">
                <p className="text-sm font-medium text-secondary">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "Администратор" : "Ученик"}</p>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <Icon name="LogOut" size={20} className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
