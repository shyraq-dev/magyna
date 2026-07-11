export default function SimpleBarChart({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex items-end gap-2" style={{ height: 140 }}>
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-ember-500/70"
            style={{ height: `${Math.max(4, (v / max) * 110)}px` }}
            title={`${labels[i]}: ${v}`}
          />
          <span className="text-[10px] text-parchment-200/50">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
