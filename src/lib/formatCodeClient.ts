export async function formatCode(language: string, code: string): Promise<string> {
  // TODO: integrate prettier / WASM formatters per language.
  // For now, return original code.
  return code;
}
