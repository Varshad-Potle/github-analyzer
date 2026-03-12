// ─── MessageContent — renders markdown-like assistant responses ───────────────

function applyInlineFormatting(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-background px-1.5 py-0.5 rounded text-solar-gold font-mono text-xs break-all">$1</code>');
}

export default function MessageContent({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // ── Skip horizontal rules ─────────────────────────────────────────────
        if (line.trim() === '---') {
            elements.push(<hr key={i} className="border-surface-raised my-2" />);
            i++;
            continue;
        }

        // ── H3 ###  ───────────────────────────────────────────────────────────
        if (line.startsWith('### ')) {
            elements.push(
                <p key={i} className="font-exo text-sm font-semibold text-solar-gold mt-3 mb-1">
                    {line.replace('### ', '')}
                </p>
            );
            i++;
            continue;
        }

        // ── H2 ##  ────────────────────────────────────────────────────────────
        if (line.startsWith('## ')) {
            elements.push(
                <p key={i} className="font-exo text-sm font-bold text-solar-orange mt-3 mb-1">
                    {line.replace('## ', '')}
                </p>
            );
            i++;
            continue;
        }

        // ── Numbered list  ────────────────────────────────────────────────────
        if (/^\d+\.\s/.test(line)) {
            const listItems: React.ReactNode[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                const text = lines[i].replace(/^\d+\.\s/, '');
                listItems.push(
                    <li key={i} className="flex gap-2 leading-relaxed">
                        <span className="text-solar-orange font-exo shrink-0">
                            {lines[i].match(/^(\d+)/)?.[1]}.
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: applyInlineFormatting(text) }} />
                    </li>
                );
                i++;
            }
            elements.push(
                <ol key={`list-${i}`} className="flex flex-col gap-1.5 my-1.5 pl-1">
                    {listItems}
                </ol>
            );
            continue;
        }

        // ── Bullet list * or - ────────────────────────────────────────────────
        if (/^[\*\-]\s/.test(line)) {
            const listItems: React.ReactNode[] = [];
            while (i < lines.length && /^[\*\-]\s/.test(lines[i])) {
                const text = lines[i].replace(/^[\*\-]\s/, '');
                listItems.push(
                    <li key={i} className="flex gap-2 leading-relaxed">
                        <span className="text-solar-orange shrink-0 mt-0.5">•</span>
                        <span dangerouslySetInnerHTML={{ __html: applyInlineFormatting(text) }} />
                    </li>
                );
                i++;
            }
            elements.push(
                <ul key={`ul-${i}`} className="flex flex-col gap-1.5 my-1.5 pl-1">
                    {listItems}
                </ul>
            );
            continue;
        }

        // ── Code block ────────────────────────────────────────────────────────
        if (line.startsWith('```')) {
            const lang = line.replace('```', '').trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <pre key={i} className="bg-background rounded-lg p-3 overflow-x-auto my-2 border border-surface-raised whitespace-pre-wrap">
                    {lang && <span className="block text-text-muted text-xs mb-2 font-exo">{lang}</span>}
                    <code className="text-solar-gold font-mono text-xs leading-relaxed">
                        {codeLines.join('\n')}
                    </code>
                </pre>
            );
            i++;
            continue;
        }

        // ── Empty line — spacing ──────────────────────────────────────────────
        if (!line.trim()) {
            elements.push(<div key={i} className="h-1" />);
            i++;
            continue;
        }

        // ── Regular paragraph ─────────────────────────────────────────────────
        elements.push(
            <p
                key={i}
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: applyInlineFormatting(line) }}
            />
        );
        i++;
    }

    return <div className="flex flex-col gap-1">{elements}</div>;
}