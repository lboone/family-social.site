"use client";

import { useHashtags } from "@/hooks/useHashtags";
import { Hash, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface HashtagPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHashtag: (hashtag: string) => void;
  currentCaption: string;
}

const HashtagPicker = ({
  isOpen,
  onClose,
  onSelectHashtag,
  currentCaption,
}: HashtagPickerProps) => {
  const { hashtags, isLoading } = useHashtags();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHashtags, setFilteredHashtags] = useState(hashtags);

  // Get hashtags already used in the current caption
  const usedHashtags =
    currentCaption.match(/#\w+/g)?.map((tag) => tag.slice(1).toLowerCase()) ||
    [];

  useEffect(() => {
    if (!searchTerm) {
      // Show popular hashtags first (sorted by count)
      setFilteredHashtags(hashtags.slice(0, 20));
    } else {
      // Filter hashtags based on search term
      const filtered = hashtags
        .filter((hashtag) =>
          hashtag.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 20);
      setFilteredHashtags(filtered);
    }
  }, [searchTerm, hashtags]);

  const handleHashtagSelect = (hashtag: string) => {
    onSelectHashtag(hashtag);
    setSearchTerm("");
  };

  const handleCreateCustomHashtag = () => {
    if (searchTerm.trim()) {
      onSelectHashtag(searchTerm.trim());
      setSearchTerm("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-96 md:max-w-md rounded-t-lg md:rounded-lg shadow-xl max-h-[85vh] md:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300 md:animate-in md:fade-in md:zoom-in md:duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Hash size={20} />
            Add Hashtag
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Hash
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search or create hashtag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 text-base"
              autoFocus
            />
          </div>

          {/* Create custom hashtag button */}
          {searchTerm &&
            !filteredHashtags.some(
              (h) => h.hashtag.toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <Button
                onClick={handleCreateCustomHashtag}
                className="w-full mt-2 bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2"
              >
                <Plus size={16} />
                Create &quot;#{searchTerm}&quot;
              </Button>
            )}
        </div>

        {/* Hashtag List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading hashtags...
            </div>
          ) : filteredHashtags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No hashtags found" : "No hashtags available"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHashtags.map((hashtagData) => {
                const isUsed = usedHashtags.includes(
                  hashtagData.hashtag.toLowerCase()
                );
                return (
                  <button
                    key={hashtagData.hashtag}
                    onClick={() => handleHashtagSelect(hashtagData.hashtag)}
                    disabled={isUsed}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isUsed
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "hover:bg-sky-50 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-sky-600" />
                        <span className="font-medium">
                          #{hashtagData.hashtag}
                        </span>
                        {isUsed && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                            Already used
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {hashtagData.count}{" "}
                        {hashtagData.count === 1 ? "post" : "posts"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600 text-center">
          Tap a hashtag to add it to your post
        </div>
      </div>
    </div>
  );
};

export default HashtagPicker;
