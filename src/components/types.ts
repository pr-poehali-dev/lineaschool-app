export interface Assignment {
  id: string;
  studentId: string;
  title: string;
  subject: string;
  date: Date;
  type: "lesson" | "homework";
  completed?: boolean;
  dueTime?: string;
  description?: string;
  answer?: string;
  createdBy: string;
  status?: "scheduled" | "attended" | "missed" | "completed" | "not_completed";
}

export interface Student {
  id: string;
  login: string;
  password: string;
  fullName: string;
  role: "student";
  teacherId?: string;
}

export interface Teacher {
  id: string;
  login: string;
  password: string;
  fullName: string;
  role: "teacher";
}

export interface User {
  id: string;
  login: string;
  fullName: string;
  role: "admin" | "teacher" | "student";
  teacherId?: string;
}