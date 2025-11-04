import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { StudentWithStats } from "./StudentCard";

interface StudentProfileProps {
  student: StudentWithStats;
  onAddPayment: () => void;
}

const StudentProfile = ({ student, onAddPayment }: StudentProfileProps) => {
  return (
    <Card className="p-6 shadow-lg border-0 bg-white lg:col-span-1">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="User" size={48} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-secondary">{student.fullName}</h2>
          <p className="text-muted-foreground">{student.login}</p>
        </div>
        
        {student.teacher && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-1">Педагог</div>
            <div className="flex items-center justify-center gap-2">
              <Icon name="GraduationCap" size={18} className="text-purple-600" />
              <span className="font-semibold">{student.teacher.fullName}</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Баланс</div>
          <Badge 
            variant={student.balance >= 0 ? "default" : "destructive"}
            className="text-xl px-4 py-2"
          >
            {student.balance >= 0 ? "+" : ""}{student.balance} ₽
          </Badge>
          <div className="mt-3 space-y-2">
            <Button onClick={onAddPayment} className="w-full" size="sm">
              <Icon name="Wallet" size={16} className="mr-2" />
              Добавить платеж
            </Button>
          </div>
        </div>

        {student.nextLesson && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">Следующий урок</div>
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Icon name="Calendar" size={18} />
              <span className="font-semibold">
                {format(student.nextLesson, "d MMMM, HH:mm", { locale: ru })}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentProfile;
