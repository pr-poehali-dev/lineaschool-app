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
}

export interface Student {
  id: string;
  login: string;
  password: string;
  fullName: string;
  role: string;
}

export interface User {
  id: string;
  login: string;
  fullName: string;
  role: string;
}
