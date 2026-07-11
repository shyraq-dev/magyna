export function generateQuoteImage(quote: string, bookTitle: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Фон — "Дала түні" градиенті
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#14141f');
  gradient.addColorStop(1, '#1c1c2a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  // Дәйексөз мәтіні
  ctx.fillStyle = '#f6efe0';
  ctx.font = '52px Georgia, serif';
  ctx.textAlign = 'center';

  const maxWidth = 880;
  const words = quote.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line) lines.push(line.trim());

  const lineHeight = 68;
  const startY = 540 - ((lines.length - 1) * lineHeight) / 2;
  lines.slice(0, 8).forEach((l, i) => {
    ctx.fillText(`"${l}"`.length > 0 ? l : l, 540, startY + i * lineHeight);
  });

  // Кітап атауы
  ctx.font = '28px Inter, sans-serif';
  ctx.fillStyle = '#e8a33d';
  ctx.fillText(`— ${bookTitle}`, 540, startY + lines.length * lineHeight + 40);

  // Wordmark
  ctx.font = '24px Georgia, serif';
  ctx.fillStyle = 'rgba(246,239,224,0.5)';
  ctx.fillText('Maǵyna', 540, 1000);

  return canvas.toDataURL('image/png');
}
