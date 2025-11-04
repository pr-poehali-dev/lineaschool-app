const ALFACRM_SYNC_URL = 'https://functions.poehali.dev/ff6e4964-b0a6-4754-a939-342ee35193d4';
const GET_STUDENTS_URL = 'https://functions.poehali.dev/649662ee-a259-46cb-a494-a090f9842573';

export interface SyncStats {
  students_added: number;
  students_updated: number;
  teachers_added: number;
  teachers_updated: number;
  payments_added: number;
}

export interface SyncResult {
  success: boolean;
  stats: SyncStats;
  timestamp: string;
}

export interface StudentData {
  id: number;
  alfacrm_id: string;
  full_name: string;
  email: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface TeacherData {
  id: number;
  alfacrm_id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentData {
  id: number;
  student_id: number;
  teacher_id: number;
  assigned_at: string;
}

export interface DatabaseData {
  students: StudentData[];
  teachers: TeacherData[];
  assignments: AssignmentData[];
}

export async function syncWithAlfaCRM(): Promise<SyncResult> {
  const response = await fetch(ALFACRM_SYNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  return response.json();
}

export async function getDataFromDatabase(): Promise<DatabaseData> {
  const response = await fetch(GET_STUDENTS_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get data: ${response.status}`);
  }

  return response.json();
}

export async function syncAndGetData(): Promise<{ syncResult: SyncResult; data: DatabaseData }> {
  const syncResult = await syncWithAlfaCRM();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const data = await getDataFromDatabase();
  
  return { syncResult, data };
}
