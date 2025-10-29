import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Assignment } from "./types";

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  assignments: Assignment[];
  onComplete: (id: string) => void;
  onStartHomework: (assignment: Assignment) => void;
}

const CalendarView = ({
  selectedDate,
  setSelectedDate,
  assignments,
  onComplete,
  onStartHomework
}: CalendarViewProps) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startDayOfWeek };
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(selectedDate);
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const getAssignmentsForDate = (day: number) => {
    const checkDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return assignments.filter(
      (a) => a.date.toDateString() === checkDate.toDateString()
    );
  };

  const todayAssignments = getAssignmentsForDate(selectedDate.getDate());

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayAssignments = getAssignmentsForDate(day);
            const isToday = day === selectedDate.getDate();
            
            const missedLesson = dayAssignments.find((a) => a.type === "lesson" && a.status === "missed");
            const notCompletedHomework = dayAssignments.find((a) => a.type === "homework" && a.status === "not_completed");
            const attendedLesson = dayAssignments.find((a) => a.type === "lesson" && a.status === "attended");
            const completedHomework = dayAssignments.find((a) => a.type === "homework" && a.status === "completed");
            const completedLateHomework = dayAssignments.find((a) => a.type === "homework" && a.status === "completed_late");
            const scheduledLesson = dayAssignments.find((a) => a.type === "lesson" && a.status === "scheduled");
            const scheduledHomework = dayAssignments.find((a) => a.type === "homework" && a.status === "scheduled");
            
            let markerElement = null;
            
            if (missedLesson) {
              markerElement = (
                <div className="w-4 h-4 flex items-center justify-center relative" title="Пропущенный урок">
                  <div className="absolute inset-0 border border-dashed border-red-600 rounded-full" />
                  <Icon name="X" size={13} className="text-red-600 relative z-10" strokeWidth={3} />
                </div>
              );
            } else if (notCompletedHomework) {
              markerElement = (
                <div className="w-4 h-4 flex items-center justify-center" title="Невыполненное ДЗ">
                  <Icon name="X" size={13} className="text-red-600" strokeWidth={3} />
                </div>
              );
            } else if (attendedLesson) {
              markerElement = (
                <div className="w-4 h-4 flex items-center justify-center relative" title="Посещенный урок">
                  <div className="absolute inset-0 border border-dashed border-green-600 rounded-full" />
                  <Icon name="Check" size={13} className="text-green-600 relative z-10" strokeWidth={3} />
                </div>
              );
            } else if (completedLateHomework) {
              markerElement = (
                <div className="w-4 h-4 flex items-center justify-center" title="ДЗ выполнено с опозданием">
                  <Icon name="Check" size={13} className="text-yellow-500" strokeWidth={3} />
                </div>
              );
            } else if (completedHomework) {
              markerElement = (
                <div className="w-4 h-4 flex items-center justify-center" title="Выполненное ДЗ">
                  <Icon name="Check" size={13} className="text-green-600" strokeWidth={3} />
                </div>
              );
            } else if (scheduledLesson) {
              markerElement = (
                <div className="w-4 h-4 flex items-center justify-center" title="Запланированный урок">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                </div>
              );
            } else if (scheduledHomework) {
              markerElement = (
                <div className="w-4 h-4 flex items-center justify-center" title="Запланированное ДЗ">
                  <div className="w-3 h-3 rounded-full bg-sky-500" />
                </div>
              );
            }

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all hover:scale-105 relative",
                  isToday
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-gray-100"
                )}
              >
                <span>{day}</span>
                {markerElement && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                    {markerElement}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary px-2">
          Задания на {selectedDate.getDate()} {monthNames[selectedDate.getMonth()].toLowerCase()}
        </h3>
        {todayAssignments.length === 0 ? (
          <Card className="p-8 text-center border-0 bg-white/60 backdrop-blur">
            <Icon name="Calendar" size={48} className="mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">На этот день нет заданий</p>
          </Card>
        ) : (
          todayAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className={cn(
                "p-5 shadow-md border-0 transition-all hover:shadow-lg",
                assignment.type === "lesson" ? "bg-accent/10" : "bg-white"
              )}
            >
              <div className="flex items-start gap-4">
                {assignment.type === "homework" && (
                  <Checkbox
                    checked={assignment.completed}
                    onCheckedChange={() => onComplete(assignment.id)}
                    className="mt-1"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className={cn(
                      "font-semibold text-secondary",
                      assignment.completed && "line-through text-muted-foreground"
                    )}>
                      {assignment.title}
                    </h4>
                    {assignment.completed && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                        <Icon name="Check" size={12} className="mr-1" />
                        Выполнено
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name={assignment.type === "lesson" ? "BookOpen" : "PenTool"} size={16} />
                      <span>{assignment.subject}</span>
                    </div>
                    {assignment.dueTime && (
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={16} />
                        <span>{assignment.dueTime}</span>
                      </div>
                    )}
                  </div>
                  {assignment.type === "homework" && !assignment.completed && (
                    <Button 
                      className="w-full mt-4" 
                      size="sm"
                      onClick={() => onStartHomework(assignment)}
                    >
                      Выполнить задание
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarView;