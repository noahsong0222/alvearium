import { useRef, useState, type ReactNode } from "react";

/** A <pre> wrapper that adds a copy button for code blocks. */
export function PreBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const text = ref.current?.textContent ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <pre ref={ref}>
      <button className="copy-btn" onClick={copy} type="button">
        {copied ? "copied" : "copy"}
      </button>
      {children}
    </pre>
  );
}
