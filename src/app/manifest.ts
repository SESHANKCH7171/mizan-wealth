import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mizan (ميزان) — Barakah & Wealth OS",
    short_name: "Mizan",
    description:
      "Personal Barakah, 1 Crore Zakaat Mission, Silat al-Rahim & Wealth OS.",
    start_url: "/",
    display: "standalone",
    background_color: "#060D0B",
    theme_color: "#060D0B",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
