// app/lib/parseMentions.tsx

import React from 'react';

export function parseMentions(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9._]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <a
          key={index}
          href={`/${username}`}
          className="text-orange-400 hover:underline"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
