import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'

/**
 * MarkdownRenderer — renders markdown content with dark-theme styling.
 * Used by AISummaryCard and VixoraAI chat messages.
 */
export default function MarkdownRenderer({ content, className = '', compact = false }) {
    if (!content) return null

    return (
        <div className={cn('markdown-prose', compact ? 'markdown-compact' : '', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => (
                    <h2 className="text-base font-bold text-white font-display mt-3 mb-1.5">{children}</h2>
                ),
                h2: ({ children }) => (
                    <h3 className="text-sm sm:text-base font-bold text-white font-display mt-3 mb-1">{children}</h3>
                ),
                h3: ({ children }) => (
                    <h4 className="text-sm font-bold text-white font-display mt-2.5 mb-1">{children}</h4>
                ),
                h4: ({ children }) => (
                    <h5 className="text-xs font-bold text-white font-display mt-2 mb-0.5">{children}</h5>
                ),
                p: ({ children }) => (
                    <p className="leading-relaxed mb-1.5 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="italic text-zinc-300">{children}</em>
                ),
                ul: ({ children }) => (
                    <ul className="space-y-1 my-1.5 pl-1">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="space-y-1 my-1.5 pl-1 list-none counter-reset-item">{children}</ol>
                ),
                li: ({ children, ordered, index }) => (
                    <li className="flex items-start gap-2 text-zinc-300">
                        <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0">•</span>
                        <div className="flex-1 leading-relaxed">{children}</div>
                    </li>
                ),
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline cursor-pointer break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </a>
                ),
                code: ({ inline, children }) => {
                    if (inline) {
                        return (
                            <code className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono text-zinc-200">
                                {children}
                            </code>
                        )
                    }
                    return (
                        <pre className="bg-white/5 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto">
                            <code className="text-xs font-mono text-zinc-200">{children}</code>
                        </pre>
                    )
                },
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-zinc-400 italic">
                        {children}
                    </blockquote>
                ),
                hr: () => (
                    <hr className="border-white/10 my-3" />
                ),
                table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                        <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                ),
                th: ({ children }) => (
                    <th className="text-left p-2 border-b border-white/10 font-semibold text-white">{children}</th>
                ),
                td: ({ children }) => (
                    <td className="p-2 border-b border-white/5 text-zinc-300">{children}</td>
                ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
