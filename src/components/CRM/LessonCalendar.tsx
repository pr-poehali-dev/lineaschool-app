import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import { Assignment } from "../types";

interface LessonCalendarProps {
  lessons: Assignment[];
  studentId: string;
}

const LessonCalendar = ({ lessons, studentId }: LessonCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const studentLessons = lessons.filter(l => l.studentId === studentId && l.type === "lesson");
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const getLessonForDay = (day: Date) => {
    return studentLessons.find(lesson => isSameDay(new Date(lesson.date), day));
  };
  
  const getStatusIcon = (status?: string, lessonType?: string) => {
    if (!status) return null;
    
    const iconMap: Record<string, { icon: string; color: string; bg: string; label: string }> = {
      'attended': { icon: 'CheckCircle2', color: 'text-green-700', bg: 'bg-green-100', label: 'Пт' },
      'missed': { icon: 'XCircle', color: 'text-red-700', bg: 'bg-red-100', label: 'Вт' },
      'scheduled': { icon: 'Clock', color: 'text-blue-700', bg: 'bg-blue-100', label: lessonType === 'group' ? 'Вт' : lessonType === 'individual_speech' ? 'Чт' : 'Пт' }
    };
    
    return iconMap[status] || null;
  };
  
  const getLessonTypeLabel = (lessonType?: string) => {
    const labels: Record<string, string> = {
      'group': 'Групповой',
      'individual_speech': 'Индивидуальный (речь)',
      'individual_neuro': 'Индивидуальный (нейро)'
    };
    return labels[lessonType || ''] || 'Урок';
  };

  return (
    <Card className="p-4 lg:p-6 shadow-lg border-0 bg-white">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
        
        <h3 className="text-lg lg:text-xl font-bold text-secondary capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: ru })}
        </h3>
        
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center text-xs lg:text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {days.map((day, idx) => {
          const lesson = getLessonForDay(day);
          const statusData = lesson ? getStatusIcon(lesson.status, lesson.lessonType) : null;
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={idx}
              className={`
                aspect-square p-1 lg:p-2 rounded-lg text-center relative
                ${!isCurrentMonth ? 'text-gray-300' : 'text-secondary'}
                ${isToday ? 'ring-2 ring-orange-500' : ''}
                ${statusData ? statusData.bg : 'bg-gray-50'}
                hover:shadow-md transition-all cursor-pointer
              `}
              title={lesson ? `${getLessonTypeLabel(lesson.lessonType)} - ${lesson.title}` : ''}
            >
              <div className="text-xs lg:text-sm font-semibold mb-0.5">{format(day, 'd')}</div>
              {statusData && (
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <Icon name={statusData.icon as any} size={12} className={statusData.color} />
                  <span className={`text-[10px] lg:text-xs font-bold ${statusData.color}`}>
                    {statusData.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-semibold text-secondary mb-3">Условные обозначения</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-xs lg:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
              <Icon name="CheckCircle2" size={14} className="text-green-700" />
            </div>
            <span className="text-green-700 font-semibold">Пт</span>
            <span className="text-muted-foreground">Проведён</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Icon name="Clock" size={14} className="text-blue-700" />
            </div>
            <span className="text-blue-700 font-semibold">Вт</span>
            <span className="text-muted-foreground">Групповой</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Icon name="Clock" size={14} className="text-blue-700" />
            </div>
            <span className="text-blue-700 font-semibold">Чт</span>
            <span className="text-muted-foreground">Индивид. (речь)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Icon name="Clock" size={14} className="text-blue-700" />
            </div>
            <span className="text-blue-700 font-semibold">Пт</span>
            <span className="text-muted-foreground">Индивид. (нейро)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
              <Icon name="XCircle" size={14} className="text-red-700" />
            </div>
            <span className="text-red-700 font-semibold">Вт</span>
            <span className="text-muted-foreground">Пропущен</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
              <Icon name="DollarSign" size={14} className="text-yellow-700" />
            </div>
            <span className="text-yellow-700 font-semibold">С6</span>
            <span className="text-muted-foreground">Списание</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs lg:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-[10px] font-bold text-green-700">
              01.01
            </div>
            <span className="text-muted-foreground">Запланирован</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-[10px] font-bold text-emerald-700">
              01.01
            </div>
            <span className="text-muted-foreground">Предоплачен</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center text-[10px] font-bold text-yellow-700">
              01.01
            </div>
            <span className="text-muted-foreground">Проведён и оплачен</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center text-[10px] font-bold text-red-700">
              01.01
            </div>
            <span className="text-muted-foreground">Проведён в долг</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-100 rounded flex items-center justify-center text-[10px] font-bold text-pink-700">
              01.01
            </div>
            <span className="text-muted-foreground">Пропуск в долг</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-[10px] font-bold text-orange-700">
              01.01
            </div>
            <span className="text-muted-foreground">Бесплатный пропуск</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-700 border-2 border-dashed border-gray-400">
              01.01
            </div>
            <span className="text-muted-foreground">Забыли провести?</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-[10px] font-bold text-white">
              01.01
            </div>
            <span className="text-muted-foreground">Проведён без списания</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LessonCalendar;
