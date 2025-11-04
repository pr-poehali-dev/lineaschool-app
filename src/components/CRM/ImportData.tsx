import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Student, Teacher } from "../types";

interface ImportDataProps {
  onImportComplete: () => void;
  onClose: () => void;
}

const ImportData = ({ onImportComplete, onClose }: ImportDataProps) => {
  const [importType, setImportType] = useState<"students" | "teachers">("students");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult("");

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setImportResult("Ошибка: файл пустой или содержит только заголовки");
        setImporting(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      const usersData = localStorage.getItem("lineaschool_users");
      const existingUsers = usersData ? JSON.parse(usersData) : [];

      let imported = 0;
      let skipped = 0;

      if (importType === "students") {
        data.forEach((row) => {
          const existingUser = existingUsers.find((u: Student) => 
            u.login === row.login || u.fullName === row.name
          );

          if (!existingUser) {
            const newStudent: Student = {
              id: Date.now().toString() + Math.random(),
              login: row.login || row.email || `student${Date.now()}`,
              password: row.password || "password123",
              fullName: row.name || row.fullName || "Без имени",
              role: "student",
              teacherId: row.teacherId || undefined,
              balance: parseFloat(row.balance) || 0
            };
            existingUsers.push(newStudent);
            imported++;
          } else {
            skipped++;
          }
        });
      } else if (importType === "teachers") {
        data.forEach((row) => {
          const existingUser = existingUsers.find((u: Teacher) => 
            u.login === row.login || u.fullName === row.name
          );

          if (!existingUser) {
            const newTeacher: Teacher = {
              id: Date.now().toString() + Math.random(),
              login: row.login || row.email || `teacher${Date.now()}`,
              password: row.password || "password123",
              fullName: row.name || row.fullName || "Без имени",
              role: "teacher"
            };
            existingUsers.push(newTeacher);
            imported++;
          } else {
            skipped++;
          }
        });
      }

      localStorage.setItem("lineaschool_users", JSON.stringify(existingUsers));
      
      setImportResult(`Успешно импортировано: ${imported}, пропущено (уже существуют): ${skipped}`);
      
      if (imported > 0) {
        setTimeout(() => {
          onImportComplete();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setImportResult(`Ошибка импорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-2xl w-full bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary">Импорт данных из AlfaCRM</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Что импортировать?</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={importType === "students" ? "default" : "outline"}
                onClick={() => setImportType("students")}
                className="h-auto py-4"
              >
                <div className="text-center">
                  <Icon name="Users" size={24} className="mx-auto mb-2" />
                  <div className="font-semibold">Учеников</div>
                </div>
              </Button>
              <Button
                variant={importType === "teachers" ? "default" : "outline"}
                onClick={() => setImportType("teachers")}
                className="h-auto py-4"
              >
                <div className="text-center">
                  <Icon name="GraduationCap" size={24} className="mx-auto mb-2" />
                  <div className="font-semibold">Педагогов</div>
                </div>
              </Button>
            </div>
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-blue-900">Как экспортировать данные из AlfaCRM:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Откройте AlfaCRM в браузере</li>
                  <li>Перейдите в раздел "Клиенты" или "Педагоги"</li>
                  <li>Нажмите "Другое" → "Экспорт в файл"</li>
                  <li>Выберите формат CSV</li>
                  <li>Выберите поля: Имя, Email/Логин, Телефон, Баланс</li>
                  <li>Нажмите "Скачать"</li>
                </ol>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex gap-3">
              <Icon name="FileText" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-green-900">Формат CSV файла:</p>
                <div className="bg-white p-3 rounded border border-green-200 font-mono text-xs">
                  {importType === "students" ? (
                    <>
                      name,login,email,phone,balance,teacherId<br />
                      Иванов Иван,ivan123,ivan@mail.ru,+79001234567,5000,2<br />
                      Петрова Мария,maria456,maria@mail.ru,+79007654321,-1000,2
                    </>
                  ) : (
                    <>
                      name,login,email,phone<br />
                      Смирнов Петр,teacher1,smirnov@mail.ru,+79001111111<br />
                      Козлова Анна,teacher2,kozlova@mail.ru,+79002222222
                    </>
                  )}
                </div>
                <p className="text-green-700 text-xs">
                  * Поля login, email, phone взаимозаменяемы - система использует первое доступное
                </p>
              </div>
            </div>
          </Card>

          <div>
            <Label htmlFor="csv-file" className="text-base font-semibold mb-3 block">
              Загрузите CSV файл
            </Label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer file:cursor-pointer"
            />
          </div>

          {importing && (
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Icon name="Loader2" size={24} className="text-blue-600 animate-spin" />
              <span className="text-blue-900 font-medium">Импортируем данные...</span>
            </div>
          )}

          {importResult && (
            <Card className={`p-4 ${importResult.includes('Ошибка') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex gap-3">
                <Icon 
                  name={importResult.includes('Ошибка') ? "AlertCircle" : "CheckCircle"} 
                  size={20} 
                  className={importResult.includes('Ошибка') ? 'text-red-600' : 'text-green-600'} 
                />
                <p className={importResult.includes('Ошибка') ? 'text-red-900' : 'text-green-900'}>
                  {importResult}
                </p>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImportData;
