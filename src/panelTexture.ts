import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";
import type { Chapter } from "./chapters";

export function createPanelTexture(chapter: Chapter, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 860;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  ctx.fillStyle = chapter.surface;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = chapter.accent;
  ctx.fillRect(0, 0, 22, canvas.height);

  ctx.globalAlpha = 0.16;
  ctx.fillStyle = chapter.ink;
  for (let x = 92; x < canvas.width; x += 72) {
    ctx.fillRect(x, 0, 1, canvas.height);
  }
  for (let y = 84; y < canvas.height; y += 72) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = chapter.ink;
  ctx.font = "700 38px Inter, ui-sans-serif, system-ui";
  ctx.fillText(chapter.kicker.toUpperCase(), 100, 106);

  ctx.font = "800 86px Inter, ui-sans-serif, system-ui";
  wrapText(ctx, chapter.title, 100, 215, 860, 92);

  ctx.font = "500 30px Inter, ui-sans-serif, system-ui";
  wrapText(ctx, chapter.body, 104, 485, 740, 42);

  drawPreviewGlyph(ctx, chapter, index);
  drawInterfaceBars(ctx, chapter);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, cursorY);
}

function drawPreviewGlyph(
  ctx: CanvasRenderingContext2D,
  chapter: Chapter,
  index: number,
) {
  const cx = 1085;
  const cy = 400;
  const rings = 5;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((index - 2) * 0.18);
  for (let i = 0; i < rings; i += 1) {
    const size = 330 - i * 52;
    ctx.globalAlpha = 0.9 - i * 0.12;
    ctx.strokeStyle = i % 2 === 0 ? chapter.accent : chapter.ink;
    ctx.lineWidth = i === 0 ? 12 : 6;
    ctx.strokeRect(-size / 2, -size / 2, size, size);
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = chapter.accent;
  ctx.beginPath();
  ctx.arc(0, 0, 54, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = chapter.surface;
  ctx.font = "800 44px Inter, ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1).padStart(2, "0"), 0, 1);
  ctx.restore();
}

function drawInterfaceBars(ctx: CanvasRenderingContext2D, chapter: Chapter) {
  const y = 700;
  const x = 104;
  const widths = [220, 335, 170, 280, 128];

  widths.forEach((width, index) => {
    ctx.globalAlpha = index % 2 === 0 ? 0.92 : 0.42;
    ctx.fillStyle = index % 2 === 0 ? chapter.accent : chapter.ink;
    ctx.fillRect(x + index * 205, y + index * 12, width, 26);
  });
  ctx.globalAlpha = 1;
}
