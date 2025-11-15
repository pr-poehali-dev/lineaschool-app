import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface AppNavigationProps {
  activeTab: "calendar" | "homework" | "profile" | "admin" | "games";
  setActiveTab: (tab: "calendar" | "homework" | "profile" | "admin" | "games") => void;
  isAdmin: boolean;
}

const AppNavigation = ({ activeTab, setActiveTab, isAdmin }: AppNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === "calendar" ? "text-primary" : "text-gray-400"
            )}
          >
            <Icon name="Calendar" size={24} />
            <span className="text-xs font-medium">Календарь</span>
          </button>
          <button
            onClick={() => setActiveTab("homework")}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === "homework" ? "text-primary" : "text-gray-400"
            )}
          >
            <Icon name="BookOpen" size={24} />
            <span className="text-xs font-medium">ДЗ</span>
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === "games" ? "text-primary" : "text-gray-400"
            )}
          >
            <Icon name="Gamepad2" size={24} />
            <span className="text-xs font-medium">Игры</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeTab === "admin" ? "text-primary" : "text-gray-400"
              )}
            >
              <Icon name="Settings" size={24} />
              <span className="text-xs font-medium">Админ</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === "profile" ? "text-primary" : "text-gray-400"
            )}
          >
            <Icon name="User" size={24} />
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppNavigation;