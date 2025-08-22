export default function JsonEditor({
    value,
    onChange
  }: {
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <textarea
        className="w-full bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
        rows={20}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{\n  "personality": "helpful",\n  "tone": "friendly",\n  "style": "conversational"\n}'
        spellCheck={false}
      />
    );
  }
  