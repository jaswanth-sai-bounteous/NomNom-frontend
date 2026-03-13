import { API_BASE_URL } from "@/api/client";

const palette = [
  { from: "#f59e0b", to: "#b45309", accent: "#fff7ed" },
  { from: "#fb7185", to: "#be123c", accent: "#fff1f2" },
  { from: "#34d399", to: "#047857", accent: "#ecfdf5" },
  { from: "#60a5fa", to: "#1d4ed8", accent: "#eff6ff" },
  { from: "#a78bfa", to: "#6d28d9", accent: "#f5f3ff" },
];

const hashText = (value: string) =>
  value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);

export const getImageUrl = (image?: string | null) => {
  if (!image) {
    return "";
  }

  if (image.includes("unsplash.com") || image.includes("source.unsplash.com")) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  return `${API_BASE_URL}/${image}`;
};

export const createFoodPlaceholder = (label: string) => {
  const colorSet = palette[hashText(label) % palette.length];
  const shortLabel = label
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorSet.from}" />
          <stop offset="100%" stop-color="${colorSet.to}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#bg)"/>
      <circle cx="320" cy="180" r="96" fill="${colorSet.accent}" opacity="0.95"/>
      <rect x="180" y="300" width="280" height="24" rx="12" fill="${colorSet.accent}" opacity="0.85"/>
      <rect x="220" y="338" width="200" height="18" rx="9" fill="${colorSet.accent}" opacity="0.65"/>
      <text x="320" y="410" text-anchor="middle" font-family="Arial" font-size="28" fill="white">
        ${shortLabel || "NomNom"}
      </text>
    </svg>
  `)}`;
};
