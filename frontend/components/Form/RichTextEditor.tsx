"use client";

import { cn } from "@/lib/utils";
import { BoldIcon, ItalicIcon, LinkIcon, SmileIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import LinkDialog from "./LinkDialog";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  name?: string;
  id?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tell us about yourself...",
  maxLength = 500,
  className,
  name,
  id,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [selectedText, setSelectedText] = useState("");

  // Handle text changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    },
    [onChange, maxLength]
  );

  // Handle selection changes to remember cursor position
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  }, []);

  // Insert text at cursor position
  const insertText = useCallback(
    (textToInsert: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = selectionStart;
      const end = selectionEnd;
      const textBefore = value.substring(0, start);
      const textAfter = value.substring(end);
      const newText = textBefore + textToInsert + textAfter;

      if (newText.length <= maxLength) {
        onChange(newText);

        // Restore cursor position after the inserted text
        setTimeout(() => {
          if (textarea) {
            const newCursorPosition = start + textToInsert.length;
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
            textarea.focus();
          }
        }, 0);
      }
    },
    [value, selectionStart, selectionEnd, onChange, maxLength]
  );

  // Format selected text with markdown-style formatting
  const formatText = useCallback(
    (formatType: "bold" | "italic" | "link") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = selectionStart;
      const end = selectionEnd;
      const selectedText = value.substring(start, end);

      if (formatType === "link") {
        // Store selection info and open dialog
        setSelectedText(selectedText);
        setShowLinkDialog(true);
        return;
      }

      let formattedText = "";

      switch (formatType) {
        case "bold":
          formattedText = `**${selectedText}**`;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          break;
      }

      const textBefore = value.substring(0, start);
      const textAfter = value.substring(end);
      const newText = textBefore + formattedText + textAfter;

      if (newText.length <= maxLength) {
        onChange(newText);

        // Select the formatted text
        setTimeout(() => {
          if (textarea) {
            const newStart = start;
            const newEnd = start + formattedText.length;
            textarea.setSelectionRange(newStart, newEnd);
            textarea.focus();
          }
        }, 0);
      }
    },
    [value, selectionStart, selectionEnd, onChange, maxLength]
  );

  // Handle link creation from dialog
  const handleLinkCreate = useCallback(
    (linkText: string, url: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = selectionStart;
      const end = selectionEnd;
      const formattedText = `[${linkText}](${url})`;

      const textBefore = value.substring(0, start);
      const textAfter = value.substring(end);
      const newText = textBefore + formattedText + textAfter;

      if (newText.length <= maxLength) {
        onChange(newText);

        // Select the formatted text
        setTimeout(() => {
          if (textarea) {
            const newStart = start;
            const newEnd = start + formattedText.length;
            textarea.setSelectionRange(newStart, newEnd);
            textarea.focus();
          }
        }, 0);
      }
    },
    [value, selectionStart, selectionEnd, onChange, maxLength]
  );

  // Handle emoji selection
  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      insertText(emoji);
      setShowEmojiPicker(false);
    },
    [insertText]
  );

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
        <button
          type="button"
          onClick={() => formatText("bold")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold (Wrap with **text**)"
        >
          <BoldIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => formatText("italic")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic (Wrap with *text*)"
        >
          <ItalicIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => formatText("link")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Add Link - Select text first or enter custom link text"
        >
          <LinkIcon size={16} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Add Emoji"
          >
            <SmileIcon size={16} />
          </button>
          {showEmojiPicker && (
            <div className="absolute top-10 left-0 z-50">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onSelect={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        placeholder={placeholder}
        className={cn(
          "w-full min-h-[7rem] p-4 border border-gray-300 rounded-b-md bg-white outline-none resize-none",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          isAtLimit && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        name={name}
        id={id}
        style={{
          fontFamily: "inherit",
        }}
      />

      {/* Character Counter & help */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-500 space-y-1">
          <div>
            Uses **bold**, *italic*, and [link text](https://url.com) formatting
            🎉
          </div>
        </div>
        <div
          className={cn(
            "font-medium",
            isAtLimit
              ? "text-red-600"
              : isNearLimit
              ? "text-yellow-600"
              : "text-gray-500"
          )}
        >
          {characterCount}/{maxLength}
        </div>
      </div>

      {/* Link Dialog */}
      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onConfirm={handleLinkCreate}
        selectedText={selectedText}
      />
    </div>
  );
}
