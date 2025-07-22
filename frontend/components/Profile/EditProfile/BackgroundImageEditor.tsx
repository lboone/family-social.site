"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface BackgroundImageEditorProps {
  imageUrl: string;
  onSave: (imageData: {
    x: number;
    y: number;
    scale: number;
    width: number;
    height: number;
  }) => void;
  onCancel: () => void;
}

const BackgroundImageEditor = ({
  imageUrl,
  onSave,
  onCancel,
}: BackgroundImageEditorProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    onSave({
      x: position.x,
      y: position.y,
      scale,
      width: containerRect.width,
      height: containerRect.height,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Edit Background Position</h3>

        {/* Editor Container */}
        <div
          ref={containerRef}
          className="relative w-full h-[300px] bg-gray-200 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Image
              src={imageUrl}
              alt="Background editor"
              fill
              className="object-contain pointer-events-none"
              draggable={false}
              priority={false}
            />
          </div>

          {/* Overlay guides */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border border-white border-opacity-50"></div>
            <div className="absolute top-1/2 left-0 right-0 border-t border-white border-opacity-30"></div>
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-white border-opacity-30"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Zoom: {(scale * 100).toFixed(0)}%
            </span>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                -
              </Button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-32"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3}
              >
                +
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>• Drag the image to reposition it</p>
            <p>• Use the zoom slider or +/- buttons to resize</p>
            <p>• The final cropped area will be used as your background</p>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" variant="default" onClick={handleSave}>
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundImageEditor;
