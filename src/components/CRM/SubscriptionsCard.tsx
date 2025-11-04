import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface SubscriptionsCardProps {
  studentId: string;
}

const SubscriptionsCard = ({ studentId }: SubscriptionsCardProps) => {
  return (
    <Card className="p-4 lg:p-6 shadow-lg border-0 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-secondary">Счета и абонементы</h3>
        <Button size="sm" variant="link" className="text-blue-600">
          добавить
        </Button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Ticket" size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-900">Абонемент "3 урока в неделю"</span>
            </div>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Icon name="Pencil" size={14} />
            </Button>
          </div>
          
          <div className="space-y-2 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Срок действия:</span>
              <span className="font-semibold text-secondary">(39 600,00/36/40)</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Диагностика, Лого+нейро, Логопед, Нейропсихолог — 
              <Icon name="Users" size={12} className="inline mx-1" />
              <Icon name="User" size={12} className="inline" />
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Calendar" size={12} />
              11.10.2025–10.02.2026
            </div>
          </div>
          
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Активный
          </Badge>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <Button size="sm" variant="link" className="text-blue-600 p-0">
            <Icon name="Archive" size={16} className="mr-1" />
            Архивные абонементы (1)
          </Button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-bold text-secondary">Скидки</h4>
          <Button size="sm" variant="link" className="text-blue-600">
            добавить
          </Button>
        </div>
        <p className="text-sm text-red-500">(не задано)</p>
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-bold text-secondary">Группы</h4>
          <Button size="sm" variant="link" className="text-blue-600">
            добавить
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Icon name="Users" size={16} className="text-blue-600" />
          <span className="text-blue-600 font-semibold">1</span>
          <Button size="sm" variant="link" className="text-blue-600 p-0">
            Группа 5 (6 чел) с 16.09.2025
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto">
            <Icon name="Pencil" size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionsCard;
