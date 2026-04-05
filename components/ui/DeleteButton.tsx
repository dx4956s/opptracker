interface Props {
  onClick: () => void;
  label: string;
}

export default function DeleteButton({ onClick, label }: Props) {
  return (
    <div className="mt-10 pt-6 border-t border-smoky4">
      <button onClick={onClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-medium text-error border border-error/30 hover:bg-error/5 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M6 6.5v4M8 6.5v4M3 3.5l.5 8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {label}
      </button>
    </div>
  );
}
