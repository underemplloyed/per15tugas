"use client";

import { FormEvent, useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  course: string;
  status: "Pending" | "Done";
  createdAt: string;
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editCourse, setEditCourse] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const json = (await res.json()) as { data?: Task[] };
      setTasks(json.data ?? []);
    } catch {
      setMessage("Gagal memuat daftar tugas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !course.trim()) return;

    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), course: course.trim() }),
      });
      const json = (await res.json()) as { data?: Task; message?: string };
      if (!res.ok || !json.data) {
        setMessage(json.message ?? "Gagal menambah tugas.");
        return;
      }
      setTasks((prev) => [json.data!, ...prev]);
      setTitle("");
      setCourse("");
      setMessage("Tugas berhasil ditambahkan.");
    } catch {
      setMessage("Terjadi kesalahan saat menambah tugas.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditCourse(task.course);
  }

  async function handleUpdate(id: number) {
    if (!editTitle.trim() || !editCourse.trim()) return;

    setMessage("");
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          course: editCourse.trim(),
        }),
      });
      const json = (await res.json()) as { data?: Task; message?: string };
      if (!res.ok || !json.data) {
        setMessage(json.message ?? "Gagal mengupdate tugas.");
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? json.data! : t)));
      setEditingId(null);
      setMessage("Tugas berhasil diperbarui.");
    } catch {
      setMessage("Terjadi kesalahan saat mengupdate tugas.");
    }
  }

  async function handleToggleStatus(task: Task) {
    const nextStatus: Task["status"] = task.status === "Done" ? "Pending" : "Done";
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await res.json()) as { data?: Task };
      if (res.ok && json.data) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? json.data! : t)));
      }
    } catch {
      setMessage("Gagal mengubah status tugas.");
    }
  }

  async function handleDelete(id: number) {
    setMessage("");
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setMessage("Gagal menghapus tugas.");
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setMessage("Tugas berhasil dihapus.");
    } catch {
      setMessage("Terjadi kesalahan saat menghapus tugas.");
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Web CRUD Daftar Tugas</h1>
        <p className="text-sm text-gray-600">
          Next.js + TypeScript dengan API Route Handlers (GET, POST, PATCH, DELETE).
        </p>
      </div>

      {message && (
        <div className="border rounded-md px-4 py-2 text-sm bg-blue-50 text-blue-900">
          {message}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="border rounded-lg p-4 space-y-3 bg-white shadow-xs"
      >
        <h2 className="font-semibold text-base">Tambah Tugas (Create)</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nama tugas"
            required
            className="border rounded px-3 py-2 flex-1 text-sm"
          />
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Mata kuliah"
            required
            className="border rounded px-3 py-2 flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
      </form>

      <section className="border rounded-lg p-4 space-y-3 bg-white shadow-xs">
        <h2 className="font-semibold text-base">Daftar Tugas (Read, Update, Delete)</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Memuat data...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada tugas.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isEditing = editingId === task.id;
              return (
                <div
                  key={task.id}
                  className="border rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="border rounded px-2 py-1 flex-1 text-sm"
                      />
                      <input
                        type="text"
                        value={editCourse}
                        onChange={(e) => setEditCourse(e.target.value)}
                        className="border rounded px-2 py-1 flex-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdate(task.id)}
                        className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-emerald-700"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-medium hover:bg-gray-300"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm ${
                              task.status === "Done" ? "line-through text-gray-400" : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(task)}
                            className={`text-xs px-2 py-0.5 rounded border ${
                              task.status === "Done"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {task.status}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">Mata Kuliah: {task.course}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          className="bg-amber-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-amber-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}