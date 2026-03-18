import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

export const runtime = "nodejs";

// サポートする画像形式
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB (Cloud Storageはより大きなファイルをサポート)

// Cloud Storage初期化
const storage = new Storage();
const bucket = storage.bucket("home-items-app-714015956955-images");

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

    // ユニークなファイル名を生成
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `uploads/${timestamp}_${randomString}.${fileExtension}`;

    // Cloud Storageにアップロード
    const fileBuffer = await file.arrayBuffer();
    const cloudFile = bucket.file(fileName);

    await cloudFile.save(Buffer.from(fileBuffer), {
      metadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000", // 1年キャッシュ
      },
      public: true, // 公開設定
    });

    // 公開URLを生成
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("[upload] Error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
