import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

interface PaymentDialogProps {
  isOpen: boolean;
  paymentType: "income" | "expense";
  paymentAmount: string;
  paymentComment: string;
  onTypeChange: (type: "income" | "expense") => void;
  onAmountChange: (amount: string) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const PaymentDialog = ({
  isOpen,
  paymentType,
  paymentAmount,
  paymentComment,
  onTypeChange,
  onAmountChange,
  onCommentChange,
  onSubmit,
  onClose
}: PaymentDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Добавить платеж</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Тип операции</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={paymentType === "income" ? "default" : "outline"}
                onClick={() => onTypeChange("income")}
                className="w-full"
              >
                <Icon name="ArrowDownCircle" size={16} className="mr-2" />
                Пополнение
              </Button>
              <Button
                variant={paymentType === "expense" ? "destructive" : "outline"}
                onClick={() => onTypeChange("expense")}
                className="w-full"
              >
                <Icon name="ArrowUpCircle" size={16} className="mr-2" />
                Списание
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Сумма (₽)</Label>
            <Input
              id="amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="Введите сумму"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="comment">Комментарий</Label>
            <Input
              id="comment"
              value={paymentComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Например: Оплата за октябрь"
              className="mt-2"
            />
          </div>

          <Button onClick={onSubmit} disabled={!paymentAmount} className="w-full">
            <Icon name="Check" size={16} className="mr-2" />
            Добавить платеж
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentDialog;
