import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import { Assignment } from "../types";

interface LessonsListProps {
  lessons: Assignment[];
  studentId: string;
}

const LessonsList = ({ lessons, studentId }: LessonsListProps) => {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [daysFilter, setDaysFilter] = useState(90);
  
  const studentLessons = lessons
    .filter(l => l.studentId === studentId && l.type === "lesson")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const now = new Date();
  
  const filteredLessons = studentLessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    const daysDiff = Math.abs((now.getTime() - lessonDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > daysFilter) return false;
    
    if (filter === "upcoming") return lessonDate >= now;
    if (filter === "past") return lessonDate < now;
    return true;
  });

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { label: string; variant: string; bg: string; text: string }> = {
      'scheduled': { label: 'Запланирован', variant: 'outline', bg: 'bg-green-50', text: 'text-green-700' },
      'attended': { label: 'Проведён и оплачен', variant: 'outline', bg: 'bg-yellow-50', text: 'text-yellow-700' },
      'missed': { label: 'Проведён в долг', variant: 'outline', bg: 'bg-red-50', text: 'text-red-700' },
    };
    
    const config = statusMap[status || 'scheduled'];
    return (
      <Badge variant={config.variant as any} className={`${config.bg} ${config.text} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getLessonTypeIcon = (lessonType?: string) => {
    if (lessonType === 'group') return { icon: 'Users', label: 'Групповой', color: 'text-blue-600' };
    if (lessonType === 'individual_speech') return { icon: 'User', label: 'Индивидуальный (речь)', color: 'text-purple-600' };
    if (lessonType === 'individual_neuro') return { icon: 'User', label: 'Индивидуальный (нейро)', color: 'text-indigo-600' };
    return { icon: 'BookOpen', label: 'Урок', color: 'text-gray-600' };
  };

  return (
    <Card className="p-4 lg:p-6 shadow-lg border-0 bg-white">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg lg:text-xl font-bold text-secondary">Виджет посещений</h3>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border rounded-md bg-white"
          >
            <option value={30}>+30 дней</option>
            <option value={60}>+60 дней</option>
            <option value={90}>+90 дней</option>
            <option value={180}>+180 дней</option>
            <option value={365}>+365 дней</option>
          </select>
          
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Все
          </Button>
          <Button
            size="sm"
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
          >
            Предстоящие
          </Button>
          <Button
            size="sm"
            variant={filter === "past" ? "default" : "outline"}
            onClick={() => setFilter("past")}
          >
            Прошедшие
          </Button>
          
          <Button size="sm" variant="ghost">
            <Icon name="Filter" size={16} />
            Фильтр
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="CalendarOff" size={48} className="mx-auto mb-3 opacity-30" />
            <p>Нет занятий за выбранный период</p>
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const typeInfo = getLessonTypeIcon(lesson.lessonType);
            const isUpcoming = new Date(lesson.date) >= now;
            
            return (
              <div
                key={lesson.id}
                className={`
                  p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer
                  ${isUpcoming ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isUpcoming ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon name={typeInfo.icon as any} size={20} className={typeInfo.color} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary mb-1">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">{typeInfo.label}</p>
                      </div>
                      {getStatusBadge(lesson.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        <span>{format(new Date(lesson.date), "dd.MM.yyyy", { locale: ru })}</span>
                      </div>
                      
                      {lesson.dueTime && (
                        <div className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          <span>{lesson.dueTime}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Icon name="BookOpen" size={14} />
                        <span>{lesson.subject}</span>
                      </div>
                      
                      {isUpcoming && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-0">
                          <Icon name="ArrowRight" size={12} className="mr-1" />
                          сейчас
                        </Badge>
                      )}
                    </div>
                    
                    {lesson.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-semibold text-secondary mb-3">Условные обозначения</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs lg:text-sm">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <div className="text-green-700 font-bold">01.01</div>
            <span className="text-muted-foreground">Запланирован</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
            <div className="text-emerald-700 font-bold">01.01</div>
            <span className="text-muted-foreground">Предоплачен</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <div className="text-yellow-700 font-bold">01.01</div>
            <span className="text-muted-foreground">Проведён и оплачен</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
            <div className="text-red-700 font-bold">01.01</div>
            <span className="text-muted-foreground">Проведён в долг</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg">
            <div className="text-pink-700 font-bold">01.01</div>
            <span className="text-muted-foreground">Пропуск в долг</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
            <div className="text-orange-700 font-bold">01.01</div>
            <span className="text-muted-foreground">Бесплатный пропуск</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-700 font-bold">01.01</div>
            <span className="text-muted-foreground">Забыли провести?</span>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-blue-500 rounded-lg">
            <div className="text-white font-bold">01.01</div>
            <span className="text-white">Проведён без списания</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LessonsList;
