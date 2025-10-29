import { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import AdminDashboard from "@/components/AdminDashboard";
import TeacherDashboard from "@/components/TeacherDashboard";
import CalendarView from "@/components/CalendarView";
import HomeworkView from "@/components/HomeworkView";
import AppHeader from "@/components/AppHeader";
import AppNavigation from "@/components/AppNavigation";
import { Assignment, Student, Teacher, User } from "@/components/types";

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
        { id: "2", login: "teacher1", password: "pass123", fullName: "Петров Петр", role: "teacher" },
        { id: "3", login: "student1", password: "pass123", fullName: "Иванов Иван", role: "student", teacherId: "2" }
      ];
      localStorage.setItem("lineaschool_users", JSON.stringify(initialUsers));
    }
    
    const assignmentsData = localStorage.getItem("lineaschool_assignments_v3");
    if (!assignmentsData) {
      const initialAssignments = [
        { id: "1", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 1).toISOString(), type: "homework", status: "not_completed", createdBy: "2" },
        { id: "2", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 2).toISOString(), type: "lesson", status: "attended", dueTime: "10:00", createdBy: "2" },
        { id: "3", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 3).toISOString(), type: "lesson", status: "missed", dueTime: "10:00", createdBy: "2" },
        { id: "4", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 4).toISOString(), type: "homework", status: "completed", completed: true, createdBy: "2" },
        { id: "5", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 5).toISOString(), type: "homework", status: "completed", completed: true, createdBy: "2" },
        { id: "6", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 6).toISOString(), type: "homework", status: "not_completed", createdBy: "2" },
        { id: "7", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 7).toISOString(), type: "lesson", status: "attended", dueTime: "10:00", createdBy: "2" },
        { id: "8", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 8).toISOString(), type: "homework", status: "completed", completed: true, createdBy: "2" },
        { id: "9", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 9).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "10", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 10).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "11", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 11).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "12", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 12).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "13a", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 13).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "13", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 14).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "14", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 15).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "15", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 16).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "16", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 17).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "17", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 18).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "18", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 19).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "18a", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 20).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "19", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 21).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "20", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 22).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "21", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 23).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "22", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 24).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "23", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 27).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "24", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 28).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "25", studentId: "3", title: "Домашнее задание", subject: "Английский", date: new Date(2025, 9, 29).toISOString(), type: "homework", status: "scheduled", createdBy: "2" },
        { id: "26", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 30).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" },
        { id: "27", studentId: "3", title: "Урок английского", subject: "Английский", date: new Date(2025, 9, 31).toISOString(), type: "lesson", status: "scheduled", dueTime: "10:00", createdBy: "2" }
      ];
      localStorage.setItem("lineaschool_assignments_v3", JSON.stringify(initialAssignments));
    }
  }, []);
  
  useEffect(() => {
    if (user && user.role === "student") {
      const assignmentsData = localStorage.getItem("lineaschool_assignments_v3");
      if (assignmentsData) {
        const allAssignments = JSON.parse(assignmentsData).map((a: any) => ({
          ...a,
          date: new Date(a.date)
        }));
        setAssignments(allAssignments.filter((a: Assignment) => a.studentId === user.id));
      }
    } else if (selectedStudent) {
      const assignmentsData = localStorage.getItem("lineaschool_assignments_v3");
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

  const getStudents = (): Student[] => {
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) return [];
    const users = JSON.parse(usersData);
    return users.filter((u: Student) => u.role === "student");
  };

  const getTeachers = (): Teacher[] => {
    const usersData = localStorage.getItem("lineaschool_users");
    if (!usersData) return [];
    const users = JSON.parse(usersData);
    return users.filter((u: Teacher) => u.role === "teacher");
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
    const assignmentsData = localStorage.getItem("lineaschool_assignments_v3");
    const allAssignments = assignmentsData ? JSON.parse(assignmentsData) : [];
    allAssignments.push(assignment);
    localStorage.setItem("lineaschool_assignments_v3", JSON.stringify(allAssignments));
    setActiveTab("calendar");
  };

  const handleComplete = (id: string) => {
    const updatedAssignments = assignments.map((a) => 
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    setAssignments(updatedAssignments);
    
    const allAssignmentsData = localStorage.getItem("lineaschool_assignments_v3");
    if (allAssignmentsData) {
      const allAssignments = JSON.parse(allAssignmentsData);
      const updated = allAssignments.map((a: any) => {
        const found = updatedAssignments.find(ua => ua.id === a.id);
        return found ? { ...a, completed: found.completed } : a;
      });
      localStorage.setItem("lineaschool_assignments_v3", JSON.stringify(updated));
    }
  };

  const handleSubmitHomework = (id: string) => {
    const updatedAssignments = assignments.map((a) => 
      a.id === id ? { ...a, completed: true, status: "completed", answer: homeworkAnswer } : a
    );
    setAssignments(updatedAssignments);
    
    const allAssignmentsData = localStorage.getItem("lineaschool_assignments_v3");
    if (allAssignmentsData) {
      const allAssignments = JSON.parse(allAssignmentsData);
      const updated = allAssignments.map((a: any) => {
        const found = updatedAssignments.find(ua => ua.id === a.id);
        return found ? { ...a, completed: found.completed, status: found.status, answer: found.answer } : a;
      });
      localStorage.setItem("lineaschool_assignments_v3", JSON.stringify(updated));
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