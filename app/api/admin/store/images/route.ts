import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_STORE_IMAGE_TYPES,
  MAX_STORE_IMAGES,
  MAX_STORE_IMAGE_BYTES,
} from "@/lib/storeImages";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return errorResponse("画像ファイルを選択してください。", 400);
  }

  if (!ALLOWED_STORE_IMAGE_TYPES.includes(file.type)) {
    return errorResponse(
      "対応していない画像形式です(JPEG・PNG・WEBP・GIFのみ)。",
      400
    );
  }

  if (file.size > MAX_STORE_IMAGE_BYTES) {
    return errorResponse("画像サイズが大きすぎます(5MBまで)。", 400);
  }

  const currentStore = await prisma.store.findUnique({
    where: {
      id: store.id,
    },
    select: {
      imageUrls: true,
    },
  });

  const currentImages = currentStore?.imageUrls ?? [];

  if (currentImages.length >= MAX_STORE_IMAGES) {
    return errorResponse(`画像は最大${MAX_STORE_IMAGES}枚までです。`, 400);
  }

  const extension = file.type.split("/")[1] ?? "jpg";
  const pathname = `stores/${store.id}/${randomUUID()}.${extension}`;

  let uploadedUrl: string;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    uploadedUrl = blob.url;
  } catch {
    return errorResponse(
      "画像のアップロードに失敗しました。Vercel Blobの設定をご確認ください。",
      500
    );
  }

  const updatedImages = [...currentImages, uploadedUrl];

  await prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      imageUrls: updatedImages,
    },
  });

  return NextResponse.json({
    imageUrls: updatedImages,
  });
}

export async function DELETE(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return errorResponse("削除する画像を指定してください。", 400);
  }

  const currentStore = await prisma.store.findUnique({
    where: {
      id: store.id,
    },
    select: {
      imageUrls: true,
    },
  });

  const currentImages = currentStore?.imageUrls ?? [];

  if (!currentImages.includes(url)) {
    return errorResponse("画像が見つかりません。", 404);
  }

  const updatedImages = currentImages.filter((image) => image !== url);

  await prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      imageUrls: updatedImages,
    },
  });

  try {
    await del(url);
  } catch {
    // best-effort cleanup; the DB update already succeeded
  }

  return NextResponse.json({
    imageUrls: updatedImages,
  });
}
