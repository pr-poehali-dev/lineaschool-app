import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export interface StudentWithStats {
  id: string;
  fullName: string;
  login: string;
  balance: number;
  lessonsTotal: number;
  lessonsAttended: number;
  homeworkTotal: number;
  homeworkCompleted: number;
  nextLesson?: Date;
  teacher?: {
    id: string;
    fullName: string;
  };
}

interface StudentCardProps {
  student: StudentWithStats;
  onClick: () => void;
}

const StudentCard = ({ student, onClick }: StudentCardProps) => {
  return (
    <Card
      className="p-5 shadow-md border-0 bg-white hover:shadow-xl transition-all cursor-pointer"
      onClick={onClick}
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
  );
};

export default StudentCard;
