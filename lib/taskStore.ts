import fs from "fs/promises";
import path from "path";

export interface Task {
  id: number;
  title: string;
  course: string;
  status: "Pending" | "Done";
  createdAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "tasks.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    const initialTasks: Task[] = [
      {
        id: 1,
        title: "Latihan CRUD Next.js & TypeScript",
        course: "Pemrograman Web",
        status: "Pending",
        createdAt: new Date().toISOString(),
      },
    ];
    await fs.writeFile(dataFile, JSON.stringify(initialTasks, null, 2), "utf-8");
  }
}

export async function getTasks(): Promise<Task[]> {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf-8");
  const parsed = JSON.parse(raw) as Task[];
  return parsed.sort((a, b) => b.id - a.id);
}

export async function createTask(title: string, course: string): Promise<Task> {
  const tasks = await getTasks();
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const newTask: Task = {
    id: nextId,
    title,
    course,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(dataFile, JSON.stringify([newTask, ...tasks], null, 2), "utf-8");
  return newTask;
}

export async function updateTask(
  id: number,
  data: Partial<Pick<Task, "title" | "course" | "status">>
): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated: Task = {
    ...tasks[index],
    ...data,
  };
  tasks[index] = updated;
  await fs.writeFile(dataFile, JSON.stringify(tasks, null, 2), "utf-8");
  return updated;
}

export async function deleteTask(id: number): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;

  await fs.writeFile(dataFile, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}