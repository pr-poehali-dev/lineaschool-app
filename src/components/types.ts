export interface Assignment {
  id: string;
  studentId: string;
  title: string;
  subject: string;
  date: Date;
  type: "lesson" | "homework";
  lessonType?: "group" | "individual_speech" | "individual_neuro";
  completed?: boolean;
  dueTime?: string;
  description?: string;
  answer?: string;
  createdBy: string;
  status?: "scheduled" | "attended" | "missed" | "completed" | "completed_late" | "not_completed";
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: Date;
  type: "income" | "expense";
  comment: string;
  createdBy: string;
}

export interface Student {
  id: string;
  login: string;
  password: string;
  fullName: string;
  role: "student";
  teacherId?: string;
  balance?: number;
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