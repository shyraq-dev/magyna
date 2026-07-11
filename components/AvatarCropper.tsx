'use client';

import { useEffect, useRef, useState } from 'react';

const VIEWPORT = 240;

export default function AvatarCropper({
  file,
  onCropped,
  onCancel,
}: {
  file: File;
  onCropped: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
    img.src = URL.createObjectURL(file);
    return () => URL.revokeObjectURL(img.src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, offset]);

  function draw() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = VIEWPORT;
    canvas.height = VIEWPORT;
    ctx.clearRect(0, 0, VIEWPORT, VIEWPORT);

    const scale = Math.max(VIEWPORT / img.width, VIEWPORT / img.height) * zoom;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = VIEWPORT / 2 - w / 2 + offset.x;
    const y = VIEWPORT / 2 - h / 2 + offset.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(VIEWPORT / 2, VIEWPORT / 2, VIEWPORT / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = { startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setOffset({
      x: dragging.current.origX + (e.clientX - dragging.current.startX),
      y: dragging.current.origY + (e.clientY - dragging.current.startY),
    });
  }
  function onPointerUp() {
    dragging.current = null;
  }

  function confirmCrop() {
    canvasRef.current?.toBlob((blob) => {
      if (blob) onCropped(blob);
    }, 'image/png');
  }

  return (
    <div className="rounded-lg border border-night-700 bg-night-900 p-4">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="mx-auto cursor-move rounded-full border border-night-600"
        style={{ touchAction: 'none' }}
      />
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-parchment-200/50">Ұлғайту</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      <p className="mt-2 text-center text-xs text-parchment-200/40">Жылжыту үшін суретті сүйреңіз</p>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={onCancel} className="focus-ring rounded-full border border-night-600 px-4 py-1.5 text-sm">
          Бас тарту
        </button>
        <button
          onClick={confirmCrop}
          className="focus-ring rounded-full bg-ember-500 px-4 py-1.5 text-sm font-medium text-night-950 hover:bg-ember-400"
        >
          Қиып сақтау
        </button>
      </div>
    </div>
  );
}
