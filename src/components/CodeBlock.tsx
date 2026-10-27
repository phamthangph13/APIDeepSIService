import { useMemo, useState } from "react";
import { copyText } from "../lib/format";
import { useToast } from "../context/ToastContext";
import { Sticker } from "./Sticker";

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
  tone?: "dark" | "light";
  className?: string;
  showCopy?: boolean;
};

const TOKEN_RE =
  /(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|await|async|function|return|import|from|export|new|true|false|null|if|else|for|of|in|class|extends|curl|POST|GET|Bearer)\b|\b\d+(?:\.\d+)?\b)/g;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlight(code: string): string {
  let result = "";
  let lastIndex = 0;
  for (const match of code.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    const token = match[0];
    result += escapeHtml(code.slice(lastIndex, index));
    let className = "tok-key";
    if (token.startsWith("//") || token.startsWith("#")) className = "tok-comment";
    else if (/^["'`]/.test(token)) className = "tok-string";
    else if (/^\d/.test(token)) className = "tok-number";
    result += `<span class="${className}">${escapeHtml(token)}</span>`;
    lastIndex = index + token.length;
  }
  result += escapeHtml(code.slice(lastIndex));
  return result;
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  tone = "dark",
  className = "",
  showCopy = true,
}: CodeBlockProps) {
  const { push } = useToast();
  const html = useMemo(() => highlight(code), [code]);

  const handleCopy = async () => {
    const ok = await copyText(code);
    push(ok ? "Đã sao chép đoạn mã" : "Không thể sao chép", ok ? "success" : "error");
  };

  return (
    <div className={`code-block code-block--${tone}${className ? ` ${className}` : ""}`}>
      <div className="code-block__bar">
        <div className="code-block__file">
          <span className="code-block__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="mono">{filename ?? language}</span>
        </div>
        <div className="code-block__actions">
          <span className="code-block__lang mono">{language}</span>
          {showCopy ? (
            <button type="button" className="code-block__copy" onClick={handleCopy}>
              <Sticker name="copy" size={19} flat decorative />
              <span>Sao chép</span>
            </button>
          ) : null}
        </div>
      </div>
      <pre className="code-block__pre">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

type CodeTab = {
  label: string;
  language: string;
  filename?: string;
  code: string;
};

type CodeTabsProps = {
  tabs: CodeTab[];
  tone?: "dark" | "light";
  className?: string;
};

export function CodeTabs({ tabs, tone = "dark", className = "" }: CodeTabsProps) {
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];

  return (
    <div className={`code-tabs${className ? ` ${className}` : ""}`}>
      <div className="code-tabs__list" role="tablist" aria-label="Chọn ngôn ngữ">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`code-tabs__tab${index === active ? " is-active" : ""}`}
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock
        code={current.code}
        language={current.language}
        filename={current.filename}
        tone={tone}
      />
    </div>
  );
}
