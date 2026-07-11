"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";

type StoreImage = {
  id: number;
  title: string;
  image: string;
  isMain: boolean;
};

export default function AdminImagesPage() {
  const [images, setImages] = useState<StoreImage[]>([]);
  const [title, setTitle] = useState("");

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImages([
      ...images,
      {
        id: Date.now(),
        title: title || file.name,
        image: imageUrl,
        isMain: images.length === 0,
      },
    ]);

    setTitle("");
  }

  function setMainImage(id: number) {
    setImages(
      images.map((image) => ({
        ...image,
        isMain: image.id === id,
      }))
    );
  }

  function deleteImage(id: number) {
    setImages(images.filter((image) => image.id !== id));
  }

  function moveImage(id: number, direction: "up" | "down") {
    const index = images.findIndex((image) => image.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= images.length) return;

    const nextImages = [...images];
    const current = nextImages[index];
    nextImages[index] = nextImages[targetIndex];
    nextImages[targetIndex] = current;

    setImages(nextImages);
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            店舗写真管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            店舗ページに表示する写真を登録します。
          </p>
        </Card>

        <Card className="space-y-4">
          <div>
            <label className="text-sm font-bold text-stone-700">
              写真タイトル
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例：施術室"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />

            <div className="w-full cursor-pointer rounded-2xl bg-green-800 py-3 text-center font-bold text-white">
              写真を選択してアップロード
            </div>
          </label>
        </Card>

        <div className="space-y-4">
          {images.map((photo, index) => (
            <Card key={photo.id} className="space-y-3">
              <div className="relative">
                <Image
                  src={photo.image}
                  alt={photo.title}
                  width={800}
                  height={600}
                  unoptimized
                  className="h-48 w-full rounded-2xl object-cover"
                />

                {photo.isMain && (
                  <span className="absolute left-3 top-3 rounded-full bg-green-800 px-3 py-1 text-xs font-bold text-white">
                    メイン画像
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-bold text-stone-900">{photo.title}</h2>

                <p className="text-sm text-stone-500">
                  写真 {index + 1}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMainImage(photo.id)}
                  className="rounded-2xl border border-green-800 py-2.5 font-bold text-green-800"
                >
                  メイン画像
                </button>

                <button
                  onClick={() => moveImage(photo.id, "up")}
                  className="rounded-2xl border border-green-800 py-2.5 font-bold text-green-800"
                >
                  ↑ 上へ
                </button>

                <button
                  onClick={() => moveImage(photo.id, "down")}
                  className="rounded-2xl border border-green-800 py-2.5 font-bold text-green-800"
                >
                  ↓ 下へ
                </button>

                <button
                  onClick={() => deleteImage(photo.id)}
                  className="rounded-2xl border border-red-300 py-2.5 font-bold text-red-600"
                >
                  削除
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
