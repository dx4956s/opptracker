interface Props {
  currency: string;
  onCurrencyChange: (v: string) => void;
  value: string;
  onValueChange: (v: string) => void;
  valuePlaceholder?: string;
  suffix?: string;
  size?: "sm" | "md";
  className?: string;
}

export default function CurrencyInput({
  currency, onCurrencyChange, value, onValueChange,
  valuePlaceholder = "e.g. 5,000", suffix, size = "md", className,
}: Props) {
  const sm = size === "sm";
  return (
    <div className={`flex items-center ${sm ? "rounded-[10px]" : "rounded-[12px]"} outline outline-1 outline-smoky5 focus-within:outline-blue500 transition-all overflow-hidden ${className ?? ""}`}>
      <input type="text" value={currency} onChange={(e) => onCurrencyChange(e.target.value.toUpperCase().slice(0, 5))} placeholder="USD"
        className={`shrink-0 px-3 ${sm ? "w-[60px] py-2.5 text-[13px]" : "w-[72px] py-3 text-[14px]"} text-smoky13 placeholder:text-smoky6 outline-none bg-transparent font-medium`} />
      <span className="w-px self-stretch bg-smoky5 shrink-0" />
      <input type="text" value={value} onChange={(e) => onValueChange(e.target.value)} placeholder={valuePlaceholder}
        className={`flex-1 px-3 ${sm ? "py-2.5 text-[13px]" : "py-3 text-[14px]"} text-smoky13 placeholder:text-smoky6 outline-none bg-transparent`} />
      {suffix && <span className={`pr-3 text-smoky6 ${sm ? "text-[12px]" : "text-[13px]"}`}>{suffix}</span>}
    </div>
  );
}
