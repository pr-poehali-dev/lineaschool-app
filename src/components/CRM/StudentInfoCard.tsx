import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { StudentWithStats } from "./StudentCard";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface StudentInfoCardProps {
  student: StudentWithStats;
}

const StudentInfoCard = ({ student }: StudentInfoCardProps) => {
  return (
    <Card className="p-4 lg:p-6 shadow-lg border-0 bg-white">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="User" size={32} className="text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl lg:text-2xl font-bold text-secondary mb-1 truncate">{student.fullName}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">клиент</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">активен</Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">цвет</Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            13.02.2018 (7 лет) • Женщина
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-3 px-4 bg-orange-50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={18} className="text-orange-600" />
          <span className="text-sm font-semibold text-orange-900">Следующее занятие</span>
        </div>
        {student.nextLesson ? (
          <span className="text-sm font-bold text-orange-600">
            {format(student.nextLesson, "dd.MM.yyyy HH:mm", { locale: ru })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Не запланировано</span>
        )}
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-muted-foreground">ID</span>
          <span className="font-semibold text-secondary">#{student.id.slice(0, 8)}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-muted-foreground">Платежи</span>
          <span className="font-semibold text-blue-600">2 шт</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-muted-foreground">Уроки</span>
          <span className="font-semibold text-blue-600">п {student.lessonsAttended} / ф {student.lessonsMissed}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-muted-foreground">Академ. часы</span>
          <span className="font-semibold text-blue-600">п {student.lessonsAttended * 2} / ф {student.lessonsMissed * 2}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-muted-foreground">Педагог</span>
          <span className="font-semibold text-secondary">{student.teacher?.fullName || "Не назначен"}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-muted-foreground">Заказчик</span>
          <span className="font-semibold text-secondary">Физ.лицо {student.fullName}</span>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground">Мобильный</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-secondary">+7(916)402-81-24</span>
            <button className="p-1.5 bg-blue-100 rounded hover:bg-blue-200 transition-colors">
              <Icon name="MessageSquare" size={16} className="text-blue-600" />
            </button>
            <button className="p-1.5 bg-green-100 rounded hover:bg-green-200 transition-colors">
              <Icon name="Phone" size={16} className="text-green-600" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentInfoCard;
