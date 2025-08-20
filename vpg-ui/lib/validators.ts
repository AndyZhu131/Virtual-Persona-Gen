export function validateSchemaJson(input: string):
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; message: string } {
  try {
    const obj = JSON.parse(input);
    if (obj && typeof obj === "object") return { ok: true, value: obj as Record<string, unknown> };
    return { ok: false, message: "JSON must be an object." };
  } catch (e: any) {
    return { ok: false, message: `Invalid JSON: ${e.message}` };
  }
}
