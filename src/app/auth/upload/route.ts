import { NextResponse } from "next/server";
import { uploadFileToBlobOrBase64 } from "@/lib/blob-upload";

export async function POST(req: Request) {
  try {
    const formData: any = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const result = await uploadFileToBlobOrBase64(file, "auth_docs");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to process file" }, { status: 500 });
  }
}
