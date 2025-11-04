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
  lessonsMissed: number;
  lessonsPaid: number;
  homeworkTotal: number;
  homeworkCompleted: number;
  homeworkLate: number;
  homeworkMissed: number;
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

      <div className="grid grid-cols-3 gap-3 pt-3 border-t">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Проведено</div>
          <div className="flex items-center gap-1">
            <Icon name="CheckCircle2" size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-green-600">{student.lessonsAttended}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Пропущено</div>
          <div className="flex items-center gap-1">
            <Icon name="XCircle" size={14} className="text-red-500" />
            <span className="text-sm font-semibold text-red-500">{student.lessonsMissed}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Оплачено</div>
          <div className="flex items-center gap-1">
            <Icon name="Wallet" size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">{student.lessonsPaid}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;