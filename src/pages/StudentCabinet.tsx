import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayLessons = getLessonsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`aspect-square border rounded-lg p-2 ${
            isToday ? "border-primary bg-primary/5" : "border-border"
          } hover:shadow-md transition-shadow`}
        >
          <div className="text-sm font-medium mb-1">{day}</div>
          <div className="space-y-1">
            {dayLessons.map((lesson) => {
              const isCompleted = lesson.status === 3 && lesson.details?.[0]?.is_attend === 1;
              const isMissed = lesson.status === 3 && lesson.details?.[0]?.is_attend === 0;
              const isScheduled = lesson.status === 1;
              const isGroup = lesson.lesson_type_id === 1;

              return (
                <div
                  key={lesson.id}
                  className={`text-xs p-1 rounded cursor-pointer ${
                    isCompleted
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : isMissed
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : isScheduled
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  title={`${lesson.subject_name || "Занятие"}\n${lesson.time_from || ""} ${
                    isGroup ? "(Групповое)" : "(Индивидуальное)"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Icon
                      name={isGroup ? "Users" : "User"}
                      size={10}
                    />
                    <span className="truncate">{lesson.time_from?.slice(11, 16) || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{student.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      {completedCount} проведено
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      <Icon name="XCircle" size={12} className="mr-1" />
                      {missedCount} пропущено
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      <Icon name="Calendar" size={12} className="mr-1" />
                      {scheduledCount} запланировано
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(student.status)}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Сегодня
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
            
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Запланировано</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Проведено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Пропущено</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentCabinet;
