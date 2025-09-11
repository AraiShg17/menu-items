import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

// アップロードディレクトリのパス
const uploadDir = join(process.cwd(), "public", "uploads");

// サポートする画像形式
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "画像ファイルが必要です" },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "サポートされていないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。",
        },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズが大きすぎます。5MB以下にしてください。" },
        { status: 400 }
      );
    }

    // アップロードディレクトリを作成（存在しない場合）
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }

    // ファイル名を生成（UUID + 元の拡張子）
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // ファイルを保存
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // 公開URLを返す
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
    });
  } catch (error) {
    console.error("[upload] Error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
