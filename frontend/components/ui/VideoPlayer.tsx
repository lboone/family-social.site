"use client";

import { cn } from "@/lib/utils";
import {
  Maximize,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
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
            // Pause when out of view - more aggressive for grid views
            videoRef.current.pause();
          }
        });
      },
      {
        threshold: aspectRatio === "square" ? 0.7 : 0.5, // Higher threshold for grid items (square aspect)
        rootMargin: aspectRatio === "square" ? "-10px" : "0px", // Earlier pause for grid items
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlayOnVisible, aspectRatio]);

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

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      // Check if we're on iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );

      if (isIOS) {
        // iOS Safari specifically - use webkit fullscreen on video element
        const video = videoRef.current as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitExitFullscreen?: () => void;
          webkitDisplayingFullscreen?: boolean;
        };

        if (video.webkitEnterFullscreen) {
          console.log("🎬 iOS: Entering fullscreen mode");
          video.webkitEnterFullscreen();
        } else {
          console.log("⚠️ iOS: webkitEnterFullscreen not available");
          // Fallback for iOS - still try standard fullscreen
          if (video.requestFullscreen) {
            await video.requestFullscreen();
          }
        }
      } else if (isSafari) {
        // Desktop Safari - try both methods
        const video = videoRef.current as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        };

        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        } else if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        // Other browsers - use container fullscreen
        if (!document.fullscreenElement) {
          if (containerRef.current && containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          }
        } else {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.log("❌ Fullscreen failed:", error);
      // Show user-friendly message for debugging
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log(
          "💡 iOS Tip: Make sure you're interacting with the video player"
        );
      }
    }
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
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        preload="metadata"
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

            {/* Right Controls - Time Display and Fullscreen */}
            <div className="flex items-center space-x-3">
              <div className="text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                title="Fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </button>
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
