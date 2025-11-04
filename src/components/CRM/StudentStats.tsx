import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { StudentWithStats } from "./StudentCard";

interface StudentStatsProps {
  student: StudentWithStats & {
    lessonsMissed: number;
    homeworkLate: number;
    homeworkMissed: number;
  };
}

const StudentStats = ({ student }: StudentStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-5 shadow-md border-0 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
          </div>
          <h3 className="font-semibold text-secondary">Уроки</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Всего уроков:</span>
            <span className="font-semibold">{student.lessonsTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Посещено:</span>
            <span className="font-semibold text-green-600">{student.lessonsAttended}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Пропущено:</span>
            <span className="font-semibold text-red-600">{student.lessonsMissed}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Посещаемость:</span>
              <span className="font-semibold text-blue-600">
                {student.lessonsTotal > 0 
                  ? Math.round((student.lessonsAttended / student.lessonsTotal) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-md border-0 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="BookOpen" size={20} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-secondary">Домашние задания</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Всего ДЗ:</span>
            <span className="font-semibold">{student.homeworkTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Выполнено:</span>
            <span className="font-semibold text-green-600">{student.homeworkCompleted}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">С опозданием:</span>
            <span className="font-semibold text-yellow-600">{student.homeworkLate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Не выполнено:</span>
            <span className="font-semibold text-red-600">{student.homeworkMissed}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentStats;
