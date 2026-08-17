import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Parses inline tokens:
 * - Timestamps (e.g. 1:23, 01:23:45) -> seek button
 * - @mentions -> link to /@username
 * - #hashtags (only alphanumeric, not markdown headers) -> link to /search?q=tag
 * - **bold** text -> <strong>
 * - URLs -> <a>
 */
function parseInline(text, onSeek, keyPrefix = "") {
    if (!text) return null;

    // Token regex: bold, timestamps, mentions, hashtags, URLs
    const tokenRegex = /(\*\*[^*]+\*\*)|((?:(?:[0-9]+:)?[0-9]{1,2}:[0-9]{2}))|(@[a-zA-Z0-9_]+)|(#[a-zA-Z0-9_]+)|(https?:\/\/[^\s]+)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
        if (!part) return null;
        const key = `${keyPrefix}-${index}`;

        // Match **Bold**
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            const boldText = part.slice(2, -2);
            return (
                <strong key={key} className="font-semibold text-white">
                    {boldText}
                </strong>
            );
        }

        // Match Timestamp (e.g., 1:23 or 01:23:45)
        const timestampMatch = part.match(/^((?:[0-9]+:)?[0-9]{1,2}:[0-9]{2})$/);
        if (timestampMatch) {
            const timeStr = timestampMatch[0];
            const timeParts = timeStr.split(':').map(Number);
            let seconds = 0;
            if (timeParts.length === 3) {
                seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
            } else if (timeParts.length === 2) {
                seconds = timeParts[0] * 60 + timeParts[1];
            }

            return (
                <button
                    key={key}
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onSeek) onSeek(seconds);
                    }}
                    className="text-primary hover:underline cursor-pointer font-medium font-mono text-xs px-0.5"
                >
                    {timeStr}
                </button>
            );
        }

        // Match Mention (@username)
        if (part.startsWith('@') && part.length > 1) {
            const username = part.slice(1);
            return (
                <Link
                    key={key}
                    to={`/@${username}`}
                    className="text-primary hover:underline cursor-pointer font-medium px-0.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </Link>
            );
        }

        // Match Hashtag (#tag) - ONLY if it follows #word syntax
        if (part.startsWith('#') && /^#[a-zA-Z0-9_]+$/.test(part)) {
            const tag = part.slice(1);
            return (
                <Link
                    key={key}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-primary hover:underline cursor-pointer font-medium px-0.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </Link>
            );
        }

        // Match URL
        if (part.startsWith('http://') || part.startsWith('https://')) {
            return (
                <a
                    key={key}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline cursor-pointer px-0.5 break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }

        // Regular Text
        return <React.Fragment key={key}>{part}</React.Fragment>;
    });
}

/**
 * Rich Text Parser for descriptions, comments, and AI summaries:
 * - Line-by-line markdown headings (###, ####, ##, #)
 * - Bullet lists (- or *)
 * - Numbered lists (1. , 2. )
 * - Timestamps, @mentions, #hashtags, **bold**, links
 */
export function ParsedText({ text, onSeek, className = "" }) {
    if (!text) return null;

    const lines = text.split('\n');

    return (
        <div className={`space-y-1.5 ${className}`}>
            {lines.map((rawLine, lineIdx) => {
                const line = rawLine.trim();

                // Empty line -> small spacer
                if (!line) {
                    return <div key={`empty-${lineIdx}`} className="h-1" />;
                }

                // Match Markdown Headings:
                // #### Heading 4
                if (line.startsWith('#### ')) {
                    const headingText = line.replace(/^####\s+/, '');
                    return (
                        <h5 key={`h4-${lineIdx}`} className="text-xs font-bold text-white font-display mt-2 mb-0.5 flex items-center gap-1.5">
                            {parseInline(headingText, onSeek, `h4-${lineIdx}`)}
                        </h5>
                    );
                }

                // ### Heading 3
                if (line.startsWith('### ')) {
                    const headingText = line.replace(/^###\s+/, '');
                    return (
                        <h4 key={`h3-${lineIdx}`} className="text-sm font-bold text-white font-display mt-2.5 mb-1 flex items-center gap-1.5">
                            {parseInline(headingText, onSeek, `h3-${lineIdx}`)}
                        </h4>
                    );
                }

                // ## Heading 2
                if (line.startsWith('## ')) {
                    const headingText = line.replace(/^##\s+/, '');
                    return (
                        <h3 key={`h2-${lineIdx}`} className="text-sm sm:text-base font-bold text-white font-display mt-3 mb-1">
                            {parseInline(headingText, onSeek, `h2-${lineIdx}`)}
                        </h3>
                    );
                }

                // # Heading 1
                if (line.startsWith('# ')) {
                    const headingText = line.replace(/^#\s+/, '');
                    return (
                        <h2 key={`h1-${lineIdx}`} className="text-base font-bold text-white font-display mt-3 mb-1.5">
                            {parseInline(headingText, onSeek, `h1-${lineIdx}`)}
                        </h2>
                    );
                }

                // Bullet Lists: '- ' or '* '
                if (/^[-*]\s+/.test(line)) {
                    const bulletText = line.replace(/^[-*]\s+/, '');
                    return (
                        <div key={`bullet-${lineIdx}`} className="flex items-start gap-2 pl-1.5 my-0.5 text-zinc-300">
                            <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0">•</span>
                            <div className="flex-1 leading-relaxed">
                                {parseInline(bulletText, onSeek, `bullet-${lineIdx}`)}
                            </div>
                        </div>
                    );
                }

                // Numbered Lists: '1. ', '2. ', etc.
                const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
                if (numMatch) {
                    const num = numMatch[1];
                    const numText = numMatch[2];
                    return (
                        <div key={`num-${lineIdx}`} className="flex items-start gap-2 pl-1.5 my-0.5 text-zinc-300">
                            <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0">{num}.</span>
                            <div className="flex-1 leading-relaxed">
                                {parseInline(numText, onSeek, `num-${lineIdx}`)}
                            </div>
                        </div>
                    );
                }

                // Regular Paragraph Line
                return (
                    <p key={`p-${lineIdx}`} className="leading-relaxed">
                        {parseInline(rawLine, onSeek, `line-${lineIdx}`)}
                    </p>
                );
            })}
        </div>
    );
}

export default ParsedText;
