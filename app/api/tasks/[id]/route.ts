import { NextRequest, NextResponse } from "next/server";
import { deleteTask, Task, updateTask } from "@/lib/taskStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const body = (await req.json()) as {
      title?: string;
      course?: string;
      status?: Task["status"];
    };

    const payload: Partial<Pick<Task, "title" | "course" | "status">> = {};
    if (typeof body.title === "string") {
      const trimmed = body.title.trim();
      if (!trimmed) {
        return NextResponse.json({ message: "Nama tugas tidak boleh kosong" }, { status: 400 });
      }
      payload.title = trimmed;
    }
    if (typeof body.course === "string") {
      const trimmed = body.course.trim();
      if (!trimmed) {
        return NextResponse.json({ message: "Mata kuliah tidak boleh kosong" }, { status: 400 });
      }
      payload.course = trimmed;
    }
    if (body.status === "Pending" || body.status === "Done") {
      payload.status = body.status;
    }

    const updated = await updateTask(id, payload);
    if (!updated) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ message: "Gagal mengupdate data tugas" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const deleted = await deleteTask(id);
    if (!deleted) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Data berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ message: "Gagal menghapus data tugas" }, { status: 500 });
  }
}