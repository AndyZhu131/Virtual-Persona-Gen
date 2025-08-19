export default function JsonEditor({
    value,
    onChange
  }: {
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <textarea
        className="w-full border rounded p-2 font-mono"
        rows={16}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{"tone":"friendly"}'
      />
    );
  }
  