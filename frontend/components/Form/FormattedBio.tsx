"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface FormattedBioProps {
  bio: string;
  className?: string;
  maxLength?: number;
  showReadMore?: boolean;
}

export default function FormattedBio({
  bio,
  className,
  maxLength,
  showReadMore = false,
}: FormattedBioProps) {
  if (!bio) return null;

  // Truncate bio if maxLength is specified
  const shouldTruncate = maxLength && bio.length > maxLength;
  const displayBio = shouldTruncate ? bio.substring(0, maxLength) + "..." : bio;

  // Parse markdown-style formatting
  const parseFormattedText = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let currentIndex = 0;
    let elementKey = 0;

    // Regex patterns for different formatting
    const patterns = [
      // Links: [text](url)
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/g,
        render: (match: RegExpMatchArray) => (
          <a
            key={elementKey++}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {match[1]}
          </a>
        ),
      },
      // Bold: **text**
      {
        regex: /\*\*([^*]+)\*\*/g,
        render: (match: RegExpMatchArray) => (
          <strong key={elementKey++} className="font-semibold">
            {match[1]}
          </strong>
        ),
      },
      // Italic: *text* (but not ** patterns)
      {
        regex: /(?<!\*)\*([^*]+)\*(?!\*)/g,
        render: (match: RegExpMatchArray) => (
          <em key={elementKey++} className="italic">
            {match[1]}
          </em>
        ),
      },
    ];

    // Process all patterns
    const allMatches: Array<{
      match: RegExpMatchArray;
      pattern: (typeof patterns)[0];
    }> = [];

    patterns.forEach((pattern) => {
      let match;
      pattern.regex.lastIndex = 0; // Reset regex
      while ((match = pattern.regex.exec(text)) !== null) {
        allMatches.push({ match, pattern });
      }
    });

    // Sort matches by position
    allMatches.sort((a, b) => a.match.index! - b.match.index!);

    // Build the result with formatted text
    allMatches.forEach(({ match, pattern }) => {
      const matchStart = match.index!;
      const matchEnd = matchStart + match[0].length;

      // Add text before this match
      if (currentIndex < matchStart) {
        const plainText = text.substring(currentIndex, matchStart);
        if (plainText) {
          parts.push(plainText);
        }
      }

      // Add the formatted element
      parts.push(pattern.render(match));
      currentIndex = matchEnd;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.substring(currentIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts.length > 0 ? parts : [text];
  };

  const formattedContent = parseFormattedText(displayBio);

  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      {formattedContent}
      {shouldTruncate && showReadMore && (
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer ml-1">
          Read more
        </span>
      )}
    </div>
  );
}
