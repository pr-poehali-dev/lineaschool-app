import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: number;
}

interface Lesson {
  id: string;
  subject_name?: string;
  teacher_name?: string;
  date: string;
  time_from?: string;
  time_to?: string;
  status?: number;
  lesson_type_id?: number;
  details?: Array<{
    is_attend?: number;
  }>;
}

const StudentCabinet = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const studentData = localStorage.getItem("studentData");
    const studentId = localStorage.getItem("studentId");

    if (!studentData || !studentId) {
      navigate("/login");
      return;
    }

    setStudent(JSON.parse(studentData));
    loadLessons(studentId);
  }, [navigate]);

  const loadLessons = async (studentId: string) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/7a191c3e-5c96-4e00-b7c4-bb0f62c9fdc2?type=lessons&customer_id=${studentId}`
      );
      
      if (!response.ok) throw new Error("Ошибка загрузки занятий");
      
      const data = await response.json();
      
      const uniqueDates = [...new Set(data.lessons?.map((l: any) => l.date))].sort();
      console.log("Уникальные даты занятий:", uniqueDates);
      console.log("Минимальная дата:", uniqueDates[0]);
      console.log("Максимальная дата:", uniqueDates[uniqueDates.length - 1]);
      
      const byStatus = {
        status1: data.lessons?.filter((l: any) => l.status === 1).length,
        status2: data.lessons?.filter((l: any) => l.status === 2).length,
        status3: data.lessons?.filter((l: any) => l.status === 3).length,
      };
      console.log("Распределение по статусам:", byStatus);
      
      setLessons(data.lessons || []);
    } catch (error) {
      console.error("Ошибка загрузки занятий:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить занятия",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentData");
    navigate("/login");
  };

  const getStatusBadge = (status?: number) => {
    const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      1: { label: "Активен", variant: "default" },
      2: { label: "Заморожен", variant: "secondary" },
      3: { label: "Завершен", variant: "outline" },
    };
    
    const statusInfo = statusMap[status || 1] || { label: "Неизвестно", variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getLessonsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return lessons.filter(lesson => lesson.date === dateStr);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    for (let i = 0; i < adjustedStart; i++) {
      days.push(<div key={`empty-${i}`} className="h-16" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayLessons = getLessonsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`h-16 relative flex flex-col items-center justify-start pt-1 ${
            isToday ? "bg-primary text-primary-foreground rounded-full w-8 h-8 mx-auto flex items-center justify-center" : ""
          }`}
        >
          <div className={`text-sm font-medium ${isToday ? "text-white" : "text-foreground"}`}>
            {day}
          </div>
          {!isToday && dayLessons.length > 0 && (
            <div className="absolute bottom-0 flex flex-wrap gap-0.5 justify-center">
              {dayLessons.map((lesson) => {
                const isCompleted = lesson.status === 3 && lesson.details?.[0]?.is_attend === 1;
                const isMissed = lesson.status === 3 && lesson.details?.[0]?.is_attend === 0;
                const isScheduled = lesson.status === 1;

                return (
                  <span key={lesson.id} className="text-lg leading-none">
                    {isScheduled && "🔵"}
                    {isCompleted && "✅"}
                    {isMissed && "❌"}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const monthName = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!student) return null;

  const initials = student.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const completedCount = lessons.filter(
    (l) => l.status === 3 && l.details?.[0]?.is_attend === 1
  ).length;
  const missedCount = lessons.filter(
    (l) => l.status === 3 && l.details?.[0]?.is_attend === 0
  ).length;
  const scheduledCount = lessons.filter((l) => l.status === 1).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="BookOpen" size={24} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-primary">LineaSchool</div>
                <div className="text-xs text-muted-foreground">Личный кабинет ученика</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
          <div className="px-4 pb-3">
            <div className="text-sm font-medium mb-1">{student.name}</div>
            <div className="text-xs text-muted-foreground">Ученик</div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <Icon name="ChevronLeft" size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <Icon name="ChevronRight" size={18} />
              </Button>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendar()}</div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-medium mb-2 text-muted-foreground">Обозначения:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔵</span>
                  <span className="text-muted-foreground">ДЗ запланировано</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔴</span>
                  <span className="text-muted-foreground">Урок запланирован</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-muted-foreground">ДЗ выполнено</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-muted-foreground">Урок посещен</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟡</span>
                  <span className="text-muted-foreground">ДЗ с опозданием</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">❌</span>
                  <span className="text-muted-foreground">Урок пропущен</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">❌</span>
                  <span className="text-muted-foreground">ДЗ не выполнено</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCabinet;