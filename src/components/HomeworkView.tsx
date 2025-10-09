import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Assignment } from "./types";

interface HomeworkViewProps {
  selectedHomework: Assignment | null;
  homeworkAnswer: string;
  setHomeworkAnswer: (answer: string) => void;
  assignments: Assignment[];
  onComplete: (id: string) => void;
  onSelectHomework: (assignment: Assignment) => void;
  onSubmitHomework: (id: string) => void;
  onCloseHomework: () => void;
}

const HomeworkView = ({
  selectedHomework,
  homeworkAnswer,
  setHomeworkAnswer,
  assignments,
  onComplete,
  onSelectHomework,
  onSubmitHomework,
  onCloseHomework
}: HomeworkViewProps) => {
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  return (
    <div className="p-6 space-y-6">
      {selectedHomework ? (
        <Card className="p-6 shadow-lg border-0 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary">Выполнение задания</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseHomework}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-secondary mb-2">{selectedHomework.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Icon name="BookOpen" size={16} />
                <span>{selectedHomework.subject}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-foreground">{selectedHomework.description}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Ваш ответ
              </label>
              <textarea
                value={homeworkAnswer}
                onChange={(e) => setHomeworkAnswer(e.target.value)}
                placeholder="Введите ответ на задание..."
                className="w-full min-h-[200px] p-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => onSubmitHomework(selectedHomework.id)}
              disabled={!homeworkAnswer.trim()}
            >
              <Icon name="Send" size={18} className="mr-2" />
              Отправить на проверку
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-secondary px-2">
            Все домашние задания
          </h3>
          <div className="space-y-4">
            {assignments
              .filter((a) => a.type === "homework")
              .map((assignment) => (
                <Card
                  key={assignment.id}
                  className="p-5 shadow-md border-0 bg-white hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={assignment.completed}
                      onCheckedChange={() => onComplete(assignment.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4
                          className={cn(
                            "font-semibold text-secondary",
                            assignment.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {assignment.title}
                        </h4>
                        {assignment.completed && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                            <Icon name="Check" size={12} className="mr-1" />
                            Выполнено
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Icon name="BookOpen" size={16} />
                          <span>{assignment.subject}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Calendar" size={16} />
                          <span>
                            {assignment.date.getDate()}{" "}
                            {monthNames[assignment.date.getMonth()].toLowerCase()}
                          </span>
                        </div>
                      </div>
                      {!assignment.completed && (
                        <Button
                          className="w-full mt-2"
                          size="sm"
                          onClick={() => onSelectHomework(assignment)}
                        >
                          Выполнить задание
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeworkView;
