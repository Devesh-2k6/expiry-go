import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData: any = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mime = file.type || "image/jpeg";
    return NextResponse.json({ url: `data:${mime};base64,${base64}` });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to process image" }, { status: 500 });
  }
}
