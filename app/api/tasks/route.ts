import { NextRequest, NextResponse } from "next/server";
import { createTask, getTasks } from "@/lib/taskStore";

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json({ data: tasks }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ message: "Gagal mengambil data tugas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { title?: string; course?: string };
    const title = (body.title ?? "").trim();
    const course = (body.course ?? "").trim();

    if (!title || !course) {
      return NextResponse.json(
        { message: "Nama tugas dan mata kuliah wajib diisi" },
        { status: 400 }
      );
    }

    const created = await createTask(title, course);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ message: "Gagal menambah data tugas" }, { status: 500 });
  }
}