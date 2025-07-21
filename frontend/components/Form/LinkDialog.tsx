"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (linkText: string, url: string) => void;
  selectedText?: string;
}

export default function LinkDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedText = "",
}: LinkDialogProps) {
  const [linkText, setLinkText] = useState(selectedText);
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<{
    linkText?: string;
    url?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate inputs
    const newErrors: { linkText?: string; url?: string } = {};

    if (!linkText.trim()) {
      newErrors.linkText = "Link text is required";
    }

    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else if (!isValidUrl(url.trim())) {
      newErrors.url = "Please enter a valid URL";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call onConfirm with the values
    onConfirm(linkText.trim(), url.trim());

    // Reset form and close dialog
    handleClose();
  };

  const handleClose = () => {
    setLinkText(selectedText);
    setUrl("");
    setErrors({});
    onOpenChange(false);
  };

  // Simple URL validation
  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Reset form when dialog opens with new selected text
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLinkText(selectedText);
      setUrl("");
      setErrors({});
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          <DialogDescription>
            Enter the text to display and the URL for your link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkText">Link Text</Label>
            <Input
              id="linkText"
              placeholder="What users will see..."
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className={errors.linkText ? "border-red-500" : ""}
            />
            {errors.linkText && (
              <p className="text-sm text-red-500">{errors.linkText}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
