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

export function toAndroidNamespace(namespace: string, name: string): string {
  if (namespace.split('.').pop() !== name) return `${namespace}.${name}`;
  return namespace.toLowerCase();
}

export function toNamespacePath(namespace: string, name: string): string {
  const parts = namespace.split('.');
  if (parts[parts.length - 1] !== name) parts.push(name);
  return parts.join('/').toLowerCase();
}
