"use client";

import { cn } from "@/lib/utils";
import { PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: "square" | "video" | "auto";
  autoPlayOnVisible?: boolean;
  onVideoClick?: () => void;
}

export default function VideoPlayer({
  src,
  poster,
  className,
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  aspectRatio = "auto",
  autoPlayOnVisible = true,
  onVideoClick,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for auto-play when visible
  useEffect(() => {
    if (!autoPlayOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsVisible(visible);

          if (visible && videoRef.current && videoRef.current.paused) {
            // Only auto-play if the video is paused
            videoRef.current.play().catch(() => {
              console.log("Autoplay was prevented");
            });
          } else if (!visible && videoRef.current && !videoRef.current.paused) {
            // Pause when out of view
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlayOnVisible]);

  // Update video volume when volume state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch((error) => {
          console.log("Play failed:", error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (!controls) return;
    // Only handle clicks that are directly on the video, not on overlays
    if (e.target === videoRef.current) {
      e.preventDefault();
      e.stopPropagation();
      togglePlay();
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      default:
        return "";
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group overflow-hidden bg-black",
        getAspectRatioClass(),
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Custom Play/Pause Overlay */}
      {controls && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            showControls || !isPlaying
              ? "opacity-100 bg-black/20 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePlay();
            }}
            className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8 ml-1" />
            )}
          </button>
        </div>
      )}

      {/* Clickable overlay for navigation - only if onVideoClick is provided */}
      {onVideoClick && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={(e) => {
            // Only handle clicks in areas that aren't controls
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const clickY = e.clientY - rect.top;
            const containerHeight = rect.height;
            const controlsHeight = 80; // Approximate height of controls area

            // If click is in the controls area (bottom 80px), don't navigate
            if (clickY > containerHeight - controlsHeight) {
              return;
            }

            // If controls are showing and click is in center area, don't navigate (play button area)
            if (showControls || !isPlaying) {
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const clickX = e.clientX - rect.left;
              const clickYRelative = clickY;

              // Check if click is near the play button (center area)
              const playButtonRadius = 50;
              const distance = Math.sqrt(
                Math.pow(clickX - centerX, 2) +
                  Math.pow(clickYRelative - centerY, 2)
              );

              if (distance <= playButtonRadius) {
                return;
              }
            }

            // Otherwise, navigate to post
            e.preventDefault();
            e.stopPropagation();
            onVideoClick();
          }}
        />
      )}

      {/* Enhanced Controls Bar */}
      {controls && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-200",
            showControls ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, rgba(255,255,255,0.3) ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, rgba(255,255,255,0.3) 100%)`,
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-1 rounded hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>

              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeXIcon className="w-5 h-5" />
                  ) : (
                    <Volume2Icon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer volume-slider"
                />
              </div>
            </div>

            {/* Right Controls - Time Display */}
            <div className="text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      )}

      {/* Video indicator badge */}
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
        VIDEO
      </div>

      {/* Muted indicator */}
      {isMuted && isPlaying && isVisible && (
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
          <VolumeXIcon className="w-3 h-3" />
          <span>MUTED</span>
        </div>
      )}

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
        .volume-slider::-moz-range-thumb {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
