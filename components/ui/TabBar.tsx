type Tab = "description" | "files" | "notes";

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
  descriptionLabel: string;
}

export default function TabBar({ tab, onChange, descriptionLabel }: Props) {
  return (
    <div className="bg-white border-t border-smoky4 px-8 flex items-center gap-1">
      {(["description", "files", "notes"] as const).map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${tab === t ? "border-blue500 text-blue500" : "border-transparent text-smoky7 hover:text-smoky13"}`}>
          {t === "description" ? descriptionLabel : t === "files" ? "Files" : "Notes"}
        </button>
      ))}
    </div>
  );
}
