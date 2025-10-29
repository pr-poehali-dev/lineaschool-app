import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function AdminSync() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const syncStudents = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(
        'https://functions.poehali.dev/7ef3480a-587f-492d-a8fa-27a1c0056429',
        { method: 'POST' }
      );
      
      if (!response.ok) throw new Error('Sync failed');
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Синхронизация учеников
          </h1>
          
          <div className="space-y-4">
            <Button 
              onClick={syncStudents}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" className="mr-2" />
                  Запустить синхронизацию
                </>
              )}
            </Button>

            {result && (
              <Card className={`p-6 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  {result.success ? (
                    <>
                      <Icon name="CheckCircle" className="text-green-500" />
                      Синхронизация завершена
                    </>
                  ) : (
                    <>
                      <Icon name="XCircle" className="text-red-500" />
                      Ошибка синхронизации
                    </>
                  )}
                </h3>
                
                {result.success ? (
                  <div className="space-y-2 text-sm">
                    <p>✅ Синхронизировано: <strong>{result.synced}</strong></p>
                    <p>⏭️ Пропущено: <strong>{result.skipped}</strong></p>
                    <p>📊 Всего учеников в AlfaCRM: <strong>{result.total_students}</strong></p>
                    
                    {result.errors?.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-orange-600">Ошибки:</p>
                        <ul className="list-disc pl-5 text-xs text-gray-600">
                          {result.errors.map((err: string, i: number) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600">{result.error}</p>
                )}
              </Card>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
