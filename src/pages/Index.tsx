import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";
import AdminDashboard from "@/components/AdminDashboard";
import TeacherDashboard from "@/components/TeacherDashboard";
import CalendarView from "@/components/CalendarView";
import HomeworkView from "@/components/HomeworkView";
import AppHeader from "@/components/AppHeader";
import AppNavigation from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Assignment, Student, Teacher, User } from "@/components/types";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 9));
  const [activeTab, setActiveTab] = useState<"calendar" | "homework" | "profile" | "admin">("calendar");
  const [selectedHomework, setSelectedHomework] = useState<Assignment | null>(null);
  const [homeworkAnswer, setHomeworkAnswer] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("lineaschool_current_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) {
      const initialUsers = [
        { id: "1", login: "admin", password: "admin123", fullName: "Администратор", role: "admin" },
        { id: "2", login: "teacher1", password: "pass123", fullName: "Петров Петр", role: "teacher" },
        { id: "3", login: "student1", password: "pass123", fullName: "Иванов Иван", role: "student", teacherId: "2" }
      ];
      localStorage.setItem("lineaschool_users", JSON.stringify(initialUsers));
    }
    
    const assignmentsData = localStorage.getItem("lineaschool_assignments_v7");
    if (!assignmentsData) {
      const tuesdays = [7, 14, 21, 28];
      const thursdays = [2, 9, 16, 23, 30];
      const fridays = [3, 10, 17, 24, 31];
      
      const initialAssignments = [
        ...tuesdays.map((day, i) => ({
          id: `tue-${day}`,
          studentId: "3",
          title: "Групповое занятие",
          subject: "Английский",
          date: new Date(2025, 9, day).toISOString(),
          type: "lesson" as const,
          lessonType: "group" as const,
          status: day === 7 ? "attended" : "scheduled",
          dueTime: "10:00",
          createdBy: "2"
        })),
        ...thursdays.map((day, i) => ({
          id: `thu-${day}`,
          studentId: "3",
          title: "Групповое занятие",
          subject: "Английский",
          date: new Date(2025, 9, day).toISOString(),
          type: "lesson" as const,
          lessonType: "group" as const,
          status: day < 9 ? "attended" : "scheduled",
          dueTime: "10:00",
          createdBy: "2"
        })),
        ...fridays.map((day, i) => ({
          id: `fri-${day}`,
          studentId: "3",
          title: "Индивидуальное занятие (логопед)",
          subject: "Логопедия",
          date: new Date(2025, 9, day).toISOString(),
          type: "lesson" as const,
          lessonType: "individual_speech" as const,
          status: day === 3 ? "missed" : (day < 9 ? "attended" : "scheduled"),
          dueTime: "11:00",
          createdBy: "2"
        })),
        { id: "hw1", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 1).toISOString(), type: "homework", status: "not_completed", createdBy: "2" },
        { id: "hw2", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 4).toISOString(), type: "homework", status: "completed_late", completed: true, createdBy: "2" },
        { id: "hw3", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 5).toISOString(), type: "homework", status: "completed", completed: true, createdBy: "2" },
        { id: "hw4", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 6).toISOString(), type: "homework", status: "not_completed", createdBy: "2" },
        { id: "hw5", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 8).toISOString(), type: "homework", status: "completed", completed: true, createdBy: "2" },
        { id: "hw6", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 11).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw7", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 12).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw8", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 13).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw9", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 15).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw10", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 18).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw11", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 19).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw12", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 20).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw13", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 22).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw14", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 25).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw15", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 26).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw16", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 27).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "hw17", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 29).toISOString(), type: "homework", status: "scheduled", createdBy: "2" }
      ];
      localStorage.setItem("lineaschool_assignments_v7", JSON.stringify(initialAssignments));
    }
  }, []);
  
  useEffect(() => {
    if (user && user.role === "student") {
      const assignmentsData = localStorage.getItem("lineaschool_assignments_v7");
      if (assignmentsData) {
        const allAssignments = JSON.parse(assignmentsData).map((a: any) => ({
          ...a,
          date: new Date(a.date)
        }));
        setAssignments(allAssignments.filter((a: Assignment) => a.studentId === user.id));
      }
    } else if (selectedStudent) {
      const assignmentsData = localStorage.getItem("lineaschool_assignments_v7");
      if (assignmentsData) {
        const allAssignments = JSON.parse(assignmentsData).map((a: any) => ({
          ...a,
          date: new Date(a.date)
        }));
        setAssignments(allAssignments.filter((a: Assignment) => a.studentId === selectedStudent.id));
      }
    }
  }, [user, selectedStudent]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("lineaschool_current_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("lineaschool_current_user");
    setActiveTab("calendar");
    setSelectedStudent(null);
  };

  const getStudents = async (): Promise<Student[]> => {
    try {
      const response = await fetch('https://functions.poehali.dev/649662ee-a259-46cb-a494-a090f9842573');
      const data = await response.json();
      return data.students || [];
    } catch (error) {
      console.error('Ошибка загрузки учеников:', error);
      return [];
    }
  };

  const getTeachers = async (): Promise<Teacher[]> => {
    try {
      const response = await fetch('https://functions.poehali.dev/649662ee-a259-46cb-a494-a090f9842573');
      const data = await response.json();
      return data.teachers || [];
    } catch (error) {
      console.error('Ошибка загрузки педагогов:', error);
      return [];
    }
  };

  const getMyStudents = (): Student[] => {
    if (!user || user.role !== "teacher") return [];
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) return [];
    const users = JSON.parse(usersData);
    return users.filter((u: Student) => u.role === "student" && u.teacherId === user.id);
  };

  const handleAddStudent = (student: Student) => {
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) return;
    const users = JSON.parse(usersData);
    users.push(student);
    localStorage.setItem("lineaschool_users", JSON.stringify(users));
    setActiveTab("calendar");
  };

  const handleAddTeacher = (teacher: Teacher) => {
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) return;
    const users = JSON.parse(usersData);
    users.push(teacher);
    localStorage.setItem("lineaschool_users", JSON.stringify(users));
    setActiveTab("calendar");
  };

  const handleAddAssignment = (assignment: Assignment) => {
    const assignmentsData = localStorage.getItem("lineaschool_assignments_v7");
    const allAssignments = assignmentsData ? JSON.parse(assignmentsData) : [];
    allAssignments.push(assignment);
    localStorage.setItem("lineaschool_assignments_v6", JSON.stringify(allAssignments));
    setActiveTab("calendar");
  };

  const handleComplete = (id: string) => {
    const updatedAssignments = assignments.map((a) => 
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    setAssignments(updatedAssignments);
    
    const allAssignmentsData = localStorage.getItem("lineaschool_assignments_v6");
    if (allAssignmentsData) {
      const allAssignments = JSON.parse(allAssignmentsData);
      const updated = allAssignments.map((a: any) => {
        const found = updatedAssignments.find(ua => ua.id === a.id);
        return found ? { ...a, completed: found.completed } : a;
      });
      localStorage.setItem("lineaschool_assignments_v7", JSON.stringify(updated));
    }
  };

  const handleSubmitHomework = (id: string) => {
    const updatedAssignments = assignments.map((a) => 
      a.id === id ? { ...a, completed: true, status: "completed", answer: homeworkAnswer } : a
    );
    setAssignments(updatedAssignments);
    
    const allAssignmentsData = localStorage.getItem("lineaschool_assignments_v6");
    if (allAssignmentsData) {
      const allAssignments = JSON.parse(allAssignmentsData);
      const updated = allAssignments.map((a: any) => {
        const found = updatedAssignments.find(ua => ua.id === a.id);
        return found ? { ...a, completed: found.completed, status: found.status, answer: found.answer } : a;
      });
      localStorage.setItem("lineaschool_assignments_v7", JSON.stringify(updated));
    }
    
    setSelectedHomework(null);
    setHomeworkAnswer("");
  };

  const handleStartHomework = (assignment: Assignment) => {
    setSelectedHomework(assignment);
    setActiveTab("homework");
  };

  const handleCloseHomework = () => {
    setSelectedHomework(null);
    setHomeworkAnswer("");
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setActiveTab("calendar");
  };

  if (!user) {
    navigate("/");
    return null;
  }

  if (user.role === "admin" && !selectedStudent) {
    const students = getStudents();
    const teachers = getTeachers();
    
    return (
      <AdminDashboard
        user={user}
        students={students}
        teachers={teachers}
        onSelectStudent={setSelectedStudent}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddStudent={handleAddStudent}
        onAddTeacher={handleAddTeacher}
        onAddAssignment={handleAddAssignment}
      />
    );
  }

  if (user.role === "teacher" && !selectedStudent) {
    const myStudents = getMyStudents();
    
    return (
      <TeacherDashboard
        user={user}
        students={myStudents}
        onSelectStudent={setSelectedStudent}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddAssignment={handleAddAssignment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto pb-20">
        <AppHeader
          user={user}
          selectedStudent={selectedStudent}
          onBack={handleBackToStudents}
          onLogout={selectedStudent ? handleBackToStudents : handleLogout}
        />

        {activeTab === "calendar" && (
          <CalendarView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            assignments={assignments}
            onComplete={handleComplete}
            onStartHomework={handleStartHomework}
          />
        )}

        {activeTab === "homework" && (
          <HomeworkView
            selectedHomework={selectedHomework}
            homeworkAnswer={homeworkAnswer}
            setHomeworkAnswer={setHomeworkAnswer}
            assignments={assignments}
            onComplete={handleComplete}
            onSelectHomework={setSelectedHomework}
            onSubmitHomework={handleSubmitHomework}
            onCloseHomework={handleCloseHomework}
          />
        )}

        <AppNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={user.role === "admin"}
        />
      </div>
    </div>
  );
};

export default Index;