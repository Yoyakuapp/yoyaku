"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

export default function StoreTopPageLink() {
  const [slug, setSlug] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSlug() {
      const response = await fetch("/api/store", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as
        | { slug?: string }
        | null;

      if (isMounted && response.ok && data?.slug) {
        setSlug(data.slug);
      }
    }

    loadSlug();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!slug) {
    return null;
  }

  return (
    <a href={`/s/${slug}`} target="_blank" rel="noreferrer" className="mb-3 block">
      <Button variant="secondary">あなたのお店のトップページ</Button>
    </a>
  );
}
