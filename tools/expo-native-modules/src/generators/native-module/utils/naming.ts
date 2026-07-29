function toWords(input: string): string[] {
  return input.toLowerCase().split(/\s|-|_/g);
}

export function toKebabCase(input: string): string {
  return toWords(input).join('-');
}

export function toClassName(input: string): string {
  const words = toWords(input);
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join('');
}
