interface Props {
  status: string | null;
  labels: Record<string, string>;
  classes: Record<string, string>;
}

export default function StatusBadge({ status, labels, classes }: Props) {
  if (!status) return <span className="text-smoky6 text-[13px]">—</span>;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium ${classes[status] ?? "bg-smoky4 text-smoky8"}`}>
      {labels[status] ?? status}
    </span>
  );
}
