import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Payment } from "../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface PaymentHistoryProps {
  payments: Payment[];
}

const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
  return (
    <Card className="p-6 shadow-lg border-0 bg-white">
      <h3 className="font-semibold text-lg mb-4 text-secondary">История платежей</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  payment.type === "income" ? "bg-green-100" : "bg-red-100"
                }`}>
                  <Icon 
                    name={payment.type === "income" ? "ArrowDownCircle" : "ArrowUpCircle"} 
                    size={16} 
                    className={payment.type === "income" ? "text-green-600" : "text-red-600"}
                  />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {payment.type === "income" ? "Пополнение" : "Списание"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(payment.date, "d MMMM yyyy, HH:mm", { locale: ru })}
                  </div>
                  {payment.comment && (
                    <div className="text-xs text-muted-foreground italic">{payment.comment}</div>
                  )}
                </div>
              </div>
              <Badge variant={payment.type === "income" ? "default" : "destructive"}>
                {payment.type === "income" ? "+" : "-"}{payment.amount} ₽
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Wallet" size={48} className="mx-auto mb-2 opacity-30" />
            <p>Платежи отсутствуют</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentHistory;
