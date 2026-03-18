import crypto from "node:crypto";

function pickColorFromText(text: string): string {
  const hash = crypto.createHash("md5").update(text).digest("hex");
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export function generateThumbnailSvg(
  title: string,
  details: string
): { svgDataUrl: string } {
  // SVGを直接生成してDataURLとして返す
  const svg = generateSvgContent(title, details);
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString(
    "base64"
  )}`;

  return { svgDataUrl };
}

// SVGコンテンツ生成
function generateSvgContent(title: string, details: string): string {
  const bg = pickColorFromText(title + details);

  // 料理名を適切な長さで改行
  const lines = wrapText(title, 8); // 8文字で改行
  const fontSize = lines.length > 1 ? 64 : 88; // 複数行の場合はフォントサイズを小さく

  // 複数行のテキストを生成
  const textElements = lines
    .map((line, index) => {
      const y = 50 + (index - (lines.length - 1) / 2) * 15; // 行間を調整
      return `<text x="50%" y="${y}%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Noto Sans" font-size="${fontSize}" font-weight="700" fill="rgba(255,255,255,0.95)">${line}</text>`;
    })
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="650" cy="120" r="80" fill="rgba(255,255,255,0.25)" />
  <circle cx="120" cy="360" r="60" fill="rgba(255,255,255,0.2)" />
  ${textElements}
</svg>`;
}

// テキストを指定した文字数で改行する関数
function wrapText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 句読点やスペースで改行を優先
    if (
      currentLine.length >= maxLength &&
      (char === "、" || char === "。" || char === " " || char === "・")
    ) {
      lines.push(currentLine);
      currentLine = "";
    } else if (currentLine.length >= maxLength * 1.5) {
      // 強制的に改行
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine += char;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
