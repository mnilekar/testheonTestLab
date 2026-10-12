import { useState } from 'preact/hooks';

interface Props {
  code: string;
  language?: string;
  label?: string;
}

export default function CodeBlock({
  code,
  language = 'typescript',
  label = 'Example code',
}: Props) {
  const [copyLabel, setCopyLabel] = useState('Copy');

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyLabel('Copied');
      window.setTimeout(() => setCopyLabel('Copy'), 1500);
    } catch {
      setCopyLabel('Select manually');
    }
  }

  return (
    <div class="code-block">
      <div class="code-block__toolbar">
        <span>{label}</span>
        <button type="button" onClick={copyCode} aria-label="Copy example code">
          {copyLabel}
        </button>
      </div>
      <pre tabIndex={0} aria-label={`${label} scrollable code`}>
        <code class={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
