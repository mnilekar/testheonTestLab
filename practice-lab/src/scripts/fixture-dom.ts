export function query<T extends Element>(
  selector: string,
  root: ParentNode = document,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Fixture element not found: ${selector}`);
  return element;
}

export function queryAll<T extends Element>(
  selector: string,
  root: ParentNode = document,
): T[] {
  return [...root.querySelectorAll<T>(selector)];
}

export function result(
  selector: string,
  message: string,
  tone: 'neutral' | 'success' | 'error' = 'neutral',
): void {
  const output = query<HTMLElement>(selector);
  output.textContent = message;
  output.dataset.tone = tone;
}

export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function valueOf(form: HTMLFormElement, name: string): string {
  return String(new FormData(form).get(name) ?? '').trim();
}
