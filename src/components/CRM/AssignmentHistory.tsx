import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Assignment } from "../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AssignmentHistoryProps {
  assignments: Assignment[];
}

const AssignmentHistory = ({ assignments }: AssignmentHistoryProps) => {
  const getStatusText = (status?: string) => {
    switch (status) {
      case "scheduled": return "Запланировано";
      case "attended": return "Посещено";
      case "missed": return "Пропущено";
      case "completed": return "Выполнено";
      case "completed_late": return "С опозданием";
      case "not_completed": return "Не выполнено";
      default: return "Запланировано";
    }
  };

  const getStatusVariant = (status?: string): "default" | "destructive" | "secondary" | "outline" => {
    if (status === "attended" || status === "completed") return "default";
    if (status === "missed" || status === "not_completed") return "destructive";
    if (status === "completed_late") return "secondary";
    return "outline";
  };

  return (
    <Card className="p-6 shadow-lg border-0 bg-white">
      <h3 className="font-semibold text-lg mb-4 text-secondary">История занятий</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {assignments.map((assignment) => (
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
            <Badge variant={getStatusVariant(assignment.status)}>
              {getStatusText(assignment.status)}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AssignmentHistory;
