import type { Persona } from "@/lib/types";

export default function PersonaList({
  items,
  currentId,
  onSelect
}: {
  items: Persona[];
  currentId?: string;
  onSelect: (p: Persona) => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((p) => (
        <li key={p.id}>
          <button
            onClick={() => onSelect(p)}
            className={`w-full text-left px-2 py-1 rounded ${currentId === p.id ? "bg-gray-100" : ""}`}
          >
            {p.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
