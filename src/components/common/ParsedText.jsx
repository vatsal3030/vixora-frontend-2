import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Parses text and converts:
 * - Timestamps (e.g. 1:23, 01:23:45) into clickable links that call onSeek(seconds)
 * - @mentions into links to /@username
 * - #hashtags into links to /search?q=hashtag
 * - URLs into clickable links
 * 
 * @param {string} text The raw text to parse
 * @param {function} onSeek Callback when a timestamp is clicked
 */
export function ParsedText({ text, onSeek, className = "" }) {
    if (!text) return null;

    // Split text into tokens based on spaces/newlines, but keep delimiters to reconstruct
    // A simpler approach is to use regex matching and replacement or split by a combined regex.
    const parts = text.split(/((?:(?:[0-9]+:)?[0-9]{1,2}:[0-9]{2})|(?:@[a-zA-Z0-9_]+)|(?:#[a-zA-Z0-9_]+)|(?:https?:\/\/[^\s]+))/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (!part) return null;

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
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onSeek) onSeek(seconds);
                            }}
                            className="text-primary hover:underline cursor-pointer font-medium px-0.5"
                        >
                            {timeStr}
                        </button>
                    );
                }

                // Match Mention (@username)
                if (part.startsWith('@')) {
                    const username = part.slice(1);
                    return (
                        <Link
                            key={index}
                            to={`/@${username}`}
                            className="text-primary hover:underline cursor-pointer font-medium px-0.5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }

                // Match Hashtag (#tag)
                if (part.startsWith('#')) {
                    const tag = part.slice(1);
                    return (
                        <Link
                            key={index}
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
                            key={index}
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
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </span>
    );
}
