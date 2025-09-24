import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoWidgetProps {
  title?: string;
}

export const TodoWidget: React.FC<TodoWidgetProps> = ({ title = "Tasks" }) => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Review dashboard settings', completed: false },
    { id: '2', text: 'Update calendar events', completed: true },
    { id: '3', text: 'Check weather forecast', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <Card className="h-full bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4" />
            <span>{completedCount}/{todos.length}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="flex-1"
          />
          <Button onClick={addTodo} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {todos.map((todo) => (
            <div 
              key={todo.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                todo.completed 
                  ? 'bg-success/10 border border-success/20' 
                  : 'bg-widget-bg/50 border border-widget-border/50'
              }`}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <span 
                className={`flex-1 ${
                  todo.completed 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}
              >
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTodo(todo.id)}
                className="opacity-50 hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {todos.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tasks yet. Add one above!</p>
          </div>
        )}
      </div>
    </Card>
  );
};