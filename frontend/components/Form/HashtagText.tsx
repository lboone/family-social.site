// components/ui/HashtagText.tsx
import { cn } from "@/lib/utils";
import { HASHTAG_REGEX } from "@/utils/constants";
import Link from "next/link";
import React from "react";

interface HashtagTextProps {
  text: string | undefined;
  className?: string;
  hashtagClassName?: string;
}

const HashtagText: React.FC<HashtagTextProps> = ({
  text,
  className = "",
  hashtagClassName = "text-blue-600 hover:text-blue-800 font-medium",
}) => {
  // Handle undefined or null text
  if (!text) {
    return <div className={className}></div>;
  }

  const renderTextWithHashtags = (inputText: string) => {
    // Split by spaces and handle each word
    const words = inputText.split(/(\s+)/); // Keep spaces in the array

    return words.map((word, index) => {
      // Check if word starts with # and has valid characters
      //const hashtagMatch = word.match(/^#([a-zA-Z0-9_]+)$/);
      const hashtagMatch = word.match(HASHTAG_REGEX);

      if (hashtagMatch) {
        const hashtag = hashtagMatch[0].slice(1);
        //const hashtag = hashtagMatch[1]; // Get hashtag without #
        return (
          <Link
            key={index}
            href={`/hashtags/${hashtag.toLowerCase()}`}
            className={(cn("hashtag-link"), hashtagClassName)} // Use cn() to combine classes if needed
          >
            {word}
          </Link>
        );
      }

      return <span key={index}>{word}</span>;
    });
  };

  return <div className={className}>{renderTextWithHashtags(text)}</div>;
};

export default HashtagText;
