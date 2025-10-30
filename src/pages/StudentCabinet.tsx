import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  room_name?: string;
  date: string;
  time_from?: string;
  time_to?: string;
  status?: number;
}

const StudentCabinet = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.log("Загружено занятий:", data.lessons?.length);
      console.log("Первое занятие:", data.lessons?.[0]);
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

  const getLessonStatusBadge = (status?: number) => {
    const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      1: { label: "Запланировано", variant: "default" },
      2: { label: "Проведено", variant: "secondary" },
      3: { label: "Отменено", variant: "destructive" },
    };
    
    const statusInfo = statusMap[status || 1] || { label: "Неизвестно", variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    }).format(date);
  };

  const upcomingLessons = lessons
    .filter(l => new Date(l.date) >= new Date() && l.status !== 3)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastLessons = lessons
    .filter(l => new Date(l.date) < new Date() || l.status === 2)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    .map(n => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
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
                  <CardDescription className="flex flex-col gap-1 mt-1">
                    {student.email && (
                      <span className="flex items-center gap-1">
                        <Icon name="Mail" size={14} />
                        {student.email}
                      </span>
                    )}
                    {student.phone && (
                      <span className="flex items-center gap-1">
                        <Icon name="Phone" size={14} />
                        {student.phone}
                      </span>
                    )}
                  </CardDescription>
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

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              <Icon name="Calendar" size={16} className="mr-2" />
              Предстоящие занятия ({upcomingLessons.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              <Icon name="History" size={16} className="mr-2" />
              История ({pastLessons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingLessons.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Icon name="CalendarX" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет запланированных занятий</p>
                </CardContent>
              </Card>
            ) : (
              upcomingLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon name="BookOpen" size={20} className="text-primary" />
                          {lesson.subject_name || "Занятие"}
                        </CardTitle>
                        <CardDescription className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" size={14} />
                            {formatDate(lesson.date)}
                          </div>
                          {lesson.time_from && lesson.time_to && (
                            <div className="flex items-center gap-2">
                              <Icon name="Clock" size={14} />
                              {lesson.time_from} - {lesson.time_to}
                            </div>
                          )}
                          {lesson.teacher_name && (
                            <div className="flex items-center gap-2">
                              <Icon name="User" size={14} />
                              {lesson.teacher_name}
                            </div>
                          )}
                          {lesson.room_name && (
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={14} />
                              {lesson.room_name}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      {getLessonStatusBadge(lesson.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastLessons.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Icon name="BookX" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">История занятий пуста</p>
                </CardContent>
              </Card>
            ) : (
              pastLessons.map((lesson) => (
                <Card key={lesson.id} className="opacity-80">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon name="BookOpen" size={20} className="text-muted-foreground" />
                          {lesson.subject_name || "Занятие"}
                        </CardTitle>
                        <CardDescription className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" size={14} />
                            {formatDate(lesson.date)}
                          </div>
                          {lesson.time_from && lesson.time_to && (
                            <div className="flex items-center gap-2">
                              <Icon name="Clock" size={14} />
                              {lesson.time_from} - {lesson.time_to}
                            </div>
                          )}
                          {lesson.teacher_name && (
                            <div className="flex items-center gap-2">
                              <Icon name="User" size={14} />
                              {lesson.teacher_name}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      {getLessonStatusBadge(lesson.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentCabinet;