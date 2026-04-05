interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)}
        className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${checked ? "bg-blue500" : "bg-smoky5"}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </div>
      <span className="text-smoky7 text-[12px]">{label}</span>
    </label>
  );
}
