import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  date: Date;
  type: "lesson" | "homework";
  completed?: boolean;
  dueTime?: string;
  description?: string;
  answer?: string;
}

const mockData: Assignment[] = [
  { id: "1", title: "Математика: Уравнения", subject: "Математика", date: new Date(2025, 9, 7), type: "lesson", dueTime: "10:00" },
  { id: "2", title: "Решить уравнения", subject: "Математика", date: new Date(2025, 9, 8), type: "homework", completed: false, description: "Решите уравнения из учебника: стр. 45, №5-10" },
  { id: "3", title: "Русский язык: Синтаксис", subject: "Русский язык", date: new Date(2025, 9, 9), type: "lesson", dueTime: "12:00" },
  { id: "4", title: "Сочинение по литературе", subject: "Литература", date: new Date(2025, 9, 10), type: "homework", completed: false, description: "Напишите сочинение на тему 'Образ главного героя'" },
  { id: "5", title: "Физика: Механика", subject: "Физика", date: new Date(2025, 9, 11), type: "lesson", dueTime: "14:00" },
  { id: "6", title: "Задачи по физике", subject: "Физика", date: new Date(2025, 9, 12), type: "homework", completed: false, description: "Решите задачи на законы Ньютона: №12, 15, 18" },
];

const Index = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(mockData);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 9));
  const [activeTab, setActiveTab] = useState<"calendar" | "homework" | "profile">("calendar");
  const [selectedHomework, setSelectedHomework] = useState<Assignment | null>(null);
  const [homeworkAnswer, setHomeworkAnswer] = useState("");

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

  const handleComplete = (id: string) => {
    setAssignments(assignments.map((a) => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  const handleSubmitHomework = (id: string) => {
    setAssignments(assignments.map((a) => 
      a.id === id ? { ...a, completed: true, answer: homeworkAnswer } : a
    ));
    setSelectedHomework(null);
    setHomeworkAnswer("");
  };

  const todayAssignments = getAssignmentsForDate(selectedDate.getDate());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto pb-20">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="px-6 pt-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gradient">LineaSchool</h1>
                <p className="text-sm text-muted-foreground mt-1">Личный кабинет ученика</p>
              </div>
              <img 
                src="https://cdn.poehali.dev/files/81420758-6ed0-43fe-b7e7-c6317caea682.png" 
                alt="LineaSchool" 
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {activeTab === "calendar" && (
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
                  const hasLesson = dayAssignments.some((a) => a.type === "lesson");
                  const hasHomework = dayAssignments.some((a) => a.type === "homework");

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                      className={cn(
                        "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all hover:scale-105",
                        isToday
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-gray-100"
                      )}
                    >
                      <span>{day}</span>
                      <div className="flex gap-1 mt-1">
                        {hasLesson && (
                          <div className="w-1 h-1 rounded-full bg-accent" />
                        )}
                        {hasHomework && (
                          <div className="w-1 h-1 rounded-full bg-purple-400" />
                        )}
                      </div>
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
                          onCheckedChange={() => handleComplete(assignment.id)}
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
                            onClick={() => {
                              setSelectedHomework(assignment);
                              setActiveTab("homework");
                            }}
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
        )}

        {activeTab === "homework" && (
          <div className="p-6 space-y-6">
            {selectedHomework ? (
              <Card className="p-6 shadow-lg border-0 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-secondary">Выполнение задания</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedHomework(null);
                      setHomeworkAnswer("");
                    }}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-secondary mb-2">{selectedHomework.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Icon name="BookOpen" size={16} />
                      <span>{selectedHomework.subject}</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-foreground">{selectedHomework.description}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Ваш ответ
                    </label>
                    <textarea
                      value={homeworkAnswer}
                      onChange={(e) => setHomeworkAnswer(e.target.value)}
                      placeholder="Введите ответ на задание..."
                      className="w-full min-h-[200px] p-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleSubmitHomework(selectedHomework.id)}
                    disabled={!homeworkAnswer.trim()}
                  >
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить на проверку
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-secondary px-2">
                  Все домашние задания
                </h3>
                <div className="space-y-4">
                  {assignments
                    .filter((a) => a.type === "homework")
                    .map((assignment) => (
                      <Card
                        key={assignment.id}
                        className="p-5 shadow-md border-0 bg-white hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={assignment.completed}
                            onCheckedChange={() => handleComplete(assignment.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4
                                className={cn(
                                  "font-semibold text-secondary",
                                  assignment.completed && "line-through text-muted-foreground"
                                )}
                              >
                                {assignment.title}
                              </h4>
                              {assignment.completed && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                                  <Icon name="Check" size={12} className="mr-1" />
                                  Выполнено
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Icon name="BookOpen" size={16} />
                                <span>{assignment.subject}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="Calendar" size={16} />
                                <span>
                                  {assignment.date.getDate()}{" "}
                                  {monthNames[assignment.date.getMonth()].toLowerCase()}
                                </span>
                              </div>
                            </div>
                            {!assignment.completed && (
                              <Button
                                className="w-full mt-2"
                                size="sm"
                                onClick={() => setSelectedHomework(assignment)}
                              >
                                Выполнить задание
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab("calendar")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeTab === "calendar" ? "text-primary" : "text-gray-400"
                )}
              >
                <Icon name="Calendar" size={24} />
                <span className="text-xs font-medium">Календарь</span>
              </button>
              <button
                onClick={() => setActiveTab("homework")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeTab === "homework" ? "text-primary" : "text-gray-400"
                )}
              >
                <Icon name="BookOpen" size={24} />
                <span className="text-xs font-medium">Домашние задания</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeTab === "profile" ? "text-primary" : "text-gray-400"
                )}
              >
                <Icon name="User" size={24} />
                <span className="text-xs font-medium">Профиль</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Index;