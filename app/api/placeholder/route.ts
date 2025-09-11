import { NextResponse } from "next/server";

export async function GET() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f1f5f9" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="650" cy="120" r="80" fill="rgba(255,255,255,0.25)" />
  <circle cx="120" cy="360" r="60" fill="rgba(255,255,255,0.2)" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Noto Sans" font-size="48" font-weight="600" fill="rgba(100,116,139,0.8)">画像生成中...</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
}
