import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yoyakus",
    short_name: "Yoyakus",
    description: "予約管理・予約プラットフォーム Yoyakus",
    start_url: "/",
    display: "standalone",
    background_color: "#ffb04a",
    theme_color: "#394f74",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
