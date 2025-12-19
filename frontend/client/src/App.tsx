import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Zap,
  BookOpen,
  Activity,
  Users,
  Plus,
  Trash2,
  Check,
  Calendar as CalendarIcon,
  AlertTriangle,
} from "lucide-react";

// --- Configuration ---
const API_BASE_URL = "/api";
const USER_ID = "1";

// --- Type Definitions ---
interface Stats {
  STR: number;
  AGI: number;
  VIT: number;
  INT: number;
  PRS: number;
}

interface Task {
  id: number;
  title: string;
  type: keyof Stats;
  completed: boolean;
}

interface HistoryEntry {
  date: string;
  completed: number;
  total: number;
}

// --- FIXED Missing Prop Types ---
interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  label: string;
  showValue?: boolean;
}

interface StatRowProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}

interface NotificationToastProps {
  title: string;
  message: string;
  type: string;
  onClose: () => void;
}

interface TaskItemProps {
  task: Task;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

interface CalendarProps {
  history: HistoryEntry[];
}

// --- Utility ---
const handleResponse = async (response: Response) => {
  if (response.ok) {
    const text = await response.text();
    if (!text.trim()) return null;

    try {
      return JSON.parse(text);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new Error(
        `JSON.parse failed. Response starts with: ${text.substring(0, 100)}...`
      );
    }
  }

  const errorText = await response.text();

  if (response.status === 404) return null;

  throw new Error(
    `API returned status ${
      response.status
    }. Body starts with: ${errorText.substring(0, 100)}...`
  );
};

// --- Components ---
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color,
  label,
  showValue = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex flex-col w-full mb-2">
      <div className="flex justify-between text-xs font-mono mb-1 text-blue-200 tracking-wider">
        <span>{label}</span>
        {showValue && (
          <span>
            {Math.floor(value)} / {max}
          </span>
        )}
      </div>
      <div className="h-4 bg-slate-900 border border-slate-700 relative overflow-hidden skew-x-[-10deg]">
        <div
          className={`h-full transition-all duration-500 ease-out ${color} relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const StatRow: React.FC<StatRowProps> = ({
  icon: Icon,
  label,
  value,
  color,
}) => (
  <div className="flex items-center justify-between mb-3 p-2 bg-slate-900/50 border-l-2 border-slate-700 hover:bg-slate-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <Icon size={18} className={color} />
      <span className="font-mono text-sm text-slate-300 tracking-widest">
        {label}
      </span>
    </div>
    <span className="font-mono text-xl font-bold text-white">
      {Math.floor(value)}
    </span>
  </div>
);

const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  message,
  type,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="animate-in fade-in slide-in-from-top-10 duration-500 fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-slate-900/90 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] p-6 min-w-[300px] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
        <div className="flex flex-col items-center">
          <div className="text-blue-400 font-bold tracking-[0.2em] text-sm mb-2 uppercase border-b border-blue-500/30 pb-1 w-full">
            {type === "levelup" ? "SYSTEM ALERT" : "QUEST INFO"}
          </div>
          <h3 className="text-white font-bold text-xl mb-1">{title}</h3>
          <p className="text-blue-200 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const getIcon = (type: keyof Stats) => {
    switch (type) {
      case "STR":
        return <Shield size={16} />;
      case "AGI":
        return <Zap size={16} />;
      case "VIT":
        return <Activity size={16} />;
      case "INT":
        return <BookOpen size={16} />;
      case "PRS":
        return <Users size={16} />;
      default:
        return <Shield size={16} />;
    }
  };

  return (
    <div
      className={`group relative p-4 mb-3 border-l-4 transition-all duration-300 hover:translate-x-1 ${
        task.completed
          ? "bg-slate-900/30 border-slate-600 opacity-50"
          : "bg-slate-800/60 border-blue-500 hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-900 text-blue-400">
            {getIcon(task.type)}
          </div>
          <div>
            <h4
              className={`font-medium ${
                task.completed ? "text-slate-500 line-through" : "text-white"
              }`}
            >
              {task.title}
            </h4>
            <span className="text-xs text-blue-300/70 font-mono">
              REWARD: +1 {task.type} XP
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {!task.completed && (
            <button
              onClick={() => onComplete(task.id)}
              className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition-colors border border-blue-500/30"
            >
              <Check size={18} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ history }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDayStatus = (day: number | null) => {
    if (!day) return "empty";

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    const entry = history.find((h) => h.date === dateStr);

    const isToday =
      day === today.getDate() && currentMonth === today.getMonth();
    const isPast = day < today.getDate() || currentMonth < today.getMonth();

    if (entry) {
      if (entry.completed >= entry.total && entry.total > 0) return "complete";
      return "fail";
    }

    if (isToday) return "today";
    if (isPast) return "missed";
    return "future";
  };

  return (
    <div className="bg-slate-900/40 p-6 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold text-slate-500 tracking-[0.2em] flex items-center gap-2">
          <CalendarIcon size={14} />
          {today.toLocaleString("default", { month: "long" }).toUpperCase()}
        </h2>
        <span className="text-xs font-mono text-slate-600">{currentYear}</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-[10px] font-mono text-slate-600">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const status = getDayStatus(day);
          let bgClass = "";

          switch (status) {
            case "complete":
              bgClass =
                "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
              break;
            case "fail":
              bgClass =
                "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
              break;
            case "missed":
              bgClass = "bg-red-900/20 border-red-900 text-red-700";
              break;
            case "today":
              bgClass =
                "bg-blue-500/20 border-blue-400 text-blue-200 animate-pulse";
              break;
            case "future":
              bgClass = "bg-slate-800/30 border-slate-800 text-slate-600";
              break;
            case "empty":
              bgClass = "invisible";
              break;
            default:
              bgClass = "bg-slate-800/50 border-slate-700";
          }

          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-xs font-mono border rounded-sm relative group ${bgClass}`}
            >
              {day}
              {day && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max">
                  <div className="bg-black text-white text-[10px] px-2 py-1 rounded border border-slate-700">
                    {status.toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-4 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500/20 border border-green-500 rounded-full"></div>{" "}
          COMPLETE
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500/20 border border-red-500 rounded-full"></div>{" "}
          FAIL
        </div>
      </div>
    </div>
  );
};



const App = () => {
  const [player, setPlayer] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: string;
  } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<keyof Stats>("STR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

      const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          // Use the correct userId for fetching
          const [playerRes, tasksRes, historyRes] = await Promise.all([
            fetch(`${API_BASE_URL}/player/${USER_ID}`),
            fetch(`${API_BASE_URL}/tasks/${USER_ID}`), // Updated endpoint
            fetch(`${API_BASE_URL}/history/${USER_ID}`), // New endpoint
          ]);
  
          const playerData = await handleResponse(playerRes);
          const tasksData = await handleResponse(tasksRes);
          const historyData = await handleResponse(historyRes);
  
          if (playerData) {
            setPlayer({
              user_id: USER_ID, // Use the ID from configuration
              level: parseInt(playerData.level) ?? 1,
              currentExp: parseInt(playerData.current_exp) ?? 0,
              maxExp: parseInt(playerData.max_exp) ?? 100,
              hp: parseInt(playerData.current_hp) ?? 100,
              maxHp: parseInt(playerData.max_hp) ?? 100,
              fatigue: parseInt(playerData.fatigue) ?? 0,
              stats: {
                STR: parseInt(playerData.strength) ?? 10,
                AGI: parseInt(playerData.agility) ?? 10,
                VIT: parseInt(playerData.vitality) ?? 10,
                INT: parseInt(playerData.intellect) ?? 10,
                PRS: parseInt(playerData.persuasion) ?? 10,
              },
            });
          } else {
            setPlayer(null); // No player data, reset to null
          }
  
          setTasks(tasksData && Array.isArray(tasksData) ? tasksData : []);
          setHistory(historyData && Array.isArray(historyData) ? historyData : []);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          console.error("API connection failed:", err);
          setError(
            `Failed to fetch data. Error: ${err.message}. Check Docker services and API routes.`
          );
          setPlayer(null); // On error, reset player and tasks
          setTasks([]);
          setHistory([]);
        } finally {
          setLoading(false);
        }
      }, []); // USER_ID is a constant, so no need to include in dependency array.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (title: string, message: string, type = "quest") => {
    setNotification({ title, message, type });
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskTitle,
          type: newTaskType,
          user_id: USER_ID, // Include user_id in the request
        }),
      });
      const data = await handleResponse(response);

      if (data) {
        setTasks((prevTasks) => [...prevTasks, data]); // Add the task returned by the backend
        setNewTaskTitle("");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      showNotification("Error", "Failed to add task.", "error");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      // We don't necessarily need to parse the response if the backend sends minimal data
      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
        showNotification("Success", "Task deleted successfully.", "quest");
      } else {
        const errorData = await handleResponse(response);
        throw new Error(errorData?.error || "Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showNotification("Error", "Failed to delete task.", "error");
    }
  };

  const completeTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.completed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: USER_ID }),
      });
      const data = await handleResponse(response);

      if (data) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === id ? { ...data.task, completed: true } : t))
        );
        setPlayer({
          user_id: USER_ID,
          level: parseInt(data.player.level) ?? 1,
          currentExp: parseInt(data.player.current_exp) ?? 0,
          maxExp: parseInt(data.player.max_exp) ?? 100,
          hp: parseInt(data.player.current_hp) ?? 100,
          maxHp: parseInt(data.player.max_hp) ?? 100,
          fatigue: parseInt(data.player.fatigue) ?? 0,
          stats: {
            STR: parseInt(data.player.strength) ?? 10,
            AGI: parseInt(data.player.agility) ?? 10,
            VIT: parseInt(data.player.vitality) ?? 10,
            INT: parseInt(data.player.intellect) ?? 10,
            PRS: parseInt(data.player.persuasion) ?? 10,
          },
        });

        if (data.leveledUp) {
          showNotification(
            "LEVEL UP!",
            "All stats recovered. Capacity increased.",
            "levelup"
          );
        } else {
          showNotification("Task Completed!", `You gained +25 EXP and +1 ${task.type} Stat.`, "quest");
        }
      }
    } catch (error) {
      console.error("Error completing task:", error);
      showNotification("Error", "Failed to complete task.", "error");
    }
  };

  const endDay = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/end-day/${USER_ID}`, {
        method: "PUT",
      });
      const data = await handleResponse(response);

      if (data && data.player) {
        setPlayer({
          user_id: USER_ID,
          level: parseInt(data.player.level) ?? 1,
          currentExp: parseInt(data.player.current_exp) ?? 0,
          maxExp: parseInt(data.player.max_exp) ?? 100,
          hp: parseInt(data.player.current_hp) ?? 100,
          maxHp: parseInt(data.player.max_hp) ?? 100,
          fatigue: parseInt(data.player.fatigue) ?? 0,
          stats: {
            STR: parseInt(data.player.strength) ?? 10,
            AGI: parseInt(data.player.agility) ?? 10,
            VIT: parseInt(data.player.vitality) ?? 10,
            INT: parseInt(data.player.intellect) ?? 10,
            PRS: parseInt(data.player.persuasion) ?? 10,
          },
        });
        setTasks([]); // All tasks are reset by the backend
        if (data.notification) {
          showNotification(
            data.notification.title,
            data.notification.message,
            data.notification.type
          );
        }
      }
    } catch (error) {
      console.error("Error ending day:", error);
      showNotification("Error", "Failed to end day.", "error");
    }
  };

  const isLowHp = player.hp / player.maxHp <= 0.5;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8">
        <div className="animate-spin text-blue-500 mb-4">
          <Zap size={48} />
        </div>
        <h1 className="text-xl font-mono tracking-widest text-blue-400">
          SYSTEM INITIALIZING...
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Connecting to Shadow Monarch's Database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8">
        <div className="text-red-500 mb-4">
          <AlertTriangle size={48} />
        </div>
        <h1 className="text-xl font-mono tracking-widest text-red-400">
          CONNECTION ERROR
        </h1>
        <p className="text-sm text-slate-400 mt-2">{error}</p>
        <p className="text-xs text-slate-500 mt-4">
          Make sure your Docker services are running: `docker-compose up`
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 overflow-x-hidden ${
        isLowHp ? "shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]" : ""
      }`}
    >
      <header className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col w-full md:w-1/2">
            <div className="flex justify-between items-end mb-1">
              <h1 className="text-2xl font-bold tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 uppercase">
                Player Status
              </h1>
              <span className="text-xs font-mono text-slate-400">
                LVL {player.level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ProgressBar
                value={player.hp}
                max={player.maxHp}
                color={isLowHp ? "bg-red-600" : "bg-blue-500"}
                label="HP"
              />
              <ProgressBar
                value={player.fatigue}
                max={100}
                color="bg-orange-500"
                label="FATIGUE"
              />
            </div>

            <div className="w-full h-1 bg-slate-800 mt-1">
              <div
                className="h-full bg-yellow-400"
                style={{
                  width: `${(player.currentExp / player.maxExp) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="text-right hidden md:block">
              <div className="text-xs text-slate-400 font-mono">CLASS</div>
              <div className="text-sm font-bold text-blue-200">
                SHADOW MONARCH
              </div>
            </div>
            <button
              onClick={endDay}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono uppercase tracking-widest transition-all"
            >
              Simulate Day End
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900/40 p-6 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-slate-500 mb-4 tracking-[0.2em] border-b border-slate-800 pb-2">
              ATTRIBUTES
            </h2>

            <StatRow
              icon={Shield}
              label="STRENGTH"
              value={player.stats.STR}
              color="text-red-400"
            />
            <StatRow
              icon={Zap}
              label="AGILITY"
              value={player.stats.AGI}
              color="text-yellow-400"
            />
            <StatRow
              icon={Activity}
              label="VITALITY"
              value={player.stats.VIT}
              color="text-green-400"
            />
            <StatRow
              icon={BookOpen}
              label="INTELLECT"
              value={player.stats.INT}
              color="text-blue-400"
            />
            <StatRow
              icon={Users}
              label="PERSUASION"
              value={player.stats.PRS}
              color="text-purple-400"
            />

            <div className="mt-4 text-xs text-slate-500 font-mono text-center">
              AVAILABLE POINTS: 0
            </div>
          </div>

          <Calendar history={history} />
        </div>

        <div className="md:col-span-2">
          {isLowHp && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 flex items-center gap-3 animate-pulse">
              <AlertTriangle className="text-red-500" />
              <span className="text-red-200 font-mono text-sm">
                WARNING: HP CRITICAL. COMPLETE TASKS TO RECOVER.
              </span>
            </div>
          )}

          <div className="bg-black/40 border border-blue-900/30 p-1">
            <div className="bg-slate-900/80 p-6 min-h-[500px] relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-blue-500"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-blue-500"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-blue-500"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-blue-500"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-100 tracking-wider">
                  DAILY QUESTS
                </h2>
                <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                  INCOMPLETE: {tasks.filter((t) => !t.completed).length}
                </span>
              </div>

              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter new quest..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:border-blue-500 text-sm font-mono"
                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                />

                <select
                  value={newTaskType}
                  onChange={(e) =>
                    setNewTaskType(e.target.value as keyof Stats)
                  }
                  className="bg-slate-800 border border-slate-700 text-white px-2 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="STR">STR</option>
                  <option value="VIT">VIT</option>
                  <option value="AGI">AGI</option>
                  <option value="INT">INT</option>
                  <option value="PRS">PRS</option>
                </select>

                <button
                  onClick={addTask}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-1">
                {tasks.length === 0 ? (
                  <div className="text-center text-slate-600 font-mono py-10">
                    NO ACTIVE QUESTS
                  </div>
                ) : (
                  tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onDelete={deleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {notification && (
        <NotificationToast
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;
