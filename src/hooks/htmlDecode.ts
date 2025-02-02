export function decodeHtmlEntities(text: string): string {
  try {
    if (typeof window !== 'undefined') {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    }
    return text;
  } catch {
    return text;
  }
}

