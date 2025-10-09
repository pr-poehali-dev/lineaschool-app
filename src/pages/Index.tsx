import { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import AdminPanel from "@/components/AdminPanel";
import AdminDashboard from "@/components/AdminDashboard";
import CalendarView from "@/components/CalendarView";
import HomeworkView from "@/components/HomeworkView";
import AppHeader from "@/components/AppHeader";
import AppNavigation from "@/components/AppNavigation";
import { Assignment, Student, User } from "@/components/types";

const Index = () => {
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
        { id: "2", login: "student1", password: "pass123", fullName: "Иванов Иван", role: "student" }
      ];
      localStorage.setItem("lineaschool_users", JSON.stringify(initialUsers));
    }
  }, []);
  
  useEffect(() => {
    if (user && user.role === "student") {
      const assignmentsData = localStorage.getItem("lineaschool_assignments");
      if (assignmentsData) {
        const allAssignments = JSON.parse(assignmentsData).map((a: any) => ({
          ...a,
          date: new Date(a.date)
        }));
        setAssignments(allAssignments.filter((a: Assignment) => a.studentId === user.id));
      }
    } else if (selectedStudent) {
      const assignmentsData = localStorage.getItem("lineaschool_assignments");
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
  };

  const getStudents = (): Student[] => {
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) return [];
    const users = JSON.parse(usersData);
    return users.filter((u: Student) => u.role === "student");
  };

  const handleComplete = (id: string) => {
    const updatedAssignments = assignments.map((a) => 
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    setAssignments(updatedAssignments);
    
    const allAssignmentsData = localStorage.getItem("lineaschool_assignments");
    if (allAssignmentsData) {
      const allAssignments = JSON.parse(allAssignmentsData);
      const updated = allAssignments.map((a: any) => {
        const found = updatedAssignments.find(ua => ua.id === a.id);
        return found ? { ...a, completed: found.completed } : a;
      });
      localStorage.setItem("lineaschool_assignments", JSON.stringify(updated));
    }
  };

  const handleSubmitHomework = (id: string) => {
    const updatedAssignments = assignments.map((a) => 
      a.id === id ? { ...a, completed: true, answer: homeworkAnswer } : a
    );
    setAssignments(updatedAssignments);
    
    const allAssignmentsData = localStorage.getItem("lineaschool_assignments");
    if (allAssignmentsData) {
      const allAssignments = JSON.parse(allAssignmentsData);
      const updated = allAssignments.map((a: any) => {
        const found = updatedAssignments.find(ua => ua.id === a.id);
        return found ? { ...a, completed: found.completed, answer: found.answer } : a;
      });
      localStorage.setItem("lineaschool_assignments", JSON.stringify(updated));
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
    return <LoginForm onLogin={handleLogin} />;
  }

  if (user?.role === "admin" && !selectedStudent) {
    const students = getStudents();
    
    return (
      <AdminDashboard
        students={students}
        onSelectStudent={setSelectedStudent}
        onAddStudent={() => setActiveTab("admin")}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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

        {activeTab === "admin" && user.role === "admin" && (
          <AdminPanel />
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
