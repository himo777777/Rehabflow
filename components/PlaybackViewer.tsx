/**
 * PlaybackViewer Component
 * Plays back recorded movement sessions with skeleton overlay
 * Shows rep scores and quality metrics synchronized with video
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  TimestampedLandmarks,
  RepScore,
  MovementSession,
} from '../types';

interface PlaybackViewerProps {
  session: MovementSession;
  onClose: () => void;
  videoUrl?: string;
}

// MediaPipe landmark connections for skeleton drawing
const POSE_CONNECTIONS = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  // Torso
  [9, 10], [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  // Right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

// Get score color
const getScoreColor = (score: number): string => {
  if (score >= 85) return '#22c55e'; // green
  if (score >= 70) return '#eab308'; // yellow
  if (score >= 50) return '#f97316'; // orange
  return '#ef4444'; // red
};

const PlaybackViewer: React.FC<PlaybackViewerProps> = ({
  session,
  onClose,
  videoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.duration || 0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedRep, setSelectedRep] = useState<number | null>(null);

  // Get landmarks and scores
  const landmarks = session.landmarks || [];
  const repScores = session.repScores || [];

  // Find current landmark frame based on time
  const currentLandmarkIndex = useMemo(() => {
    if (landmarks.length === 0) return -1;
    const timeMs = currentTime * 1000;

    // Binary search for closest frame
    let left = 0;
    let right = landmarks.length - 1;

    while (left < right) {
      const mid = Math.floor((left + right + 1) / 2);
      if (landmarks[mid].timestamp <= timeMs) {
        left = mid;
      } else {
        right = mid - 1;
      }
    }

    return left;
  }, [currentTime, landmarks]);

  // Get current rep based on time
  const currentRepIndex = useMemo(() => {
    if (repScores.length === 0) return -1;
    const timeMs = currentTime * 1000;

    for (let i = repScores.length - 1; i >= 0; i--) {
      const repTime = new Date(repScores[i].timestamp).getTime() -
                      new Date(session.sessionDate).getTime();
      if (repTime <= timeMs) {
        return i;
      }
    }
    return -1;
  }, [currentTime, repScores, session.sessionDate]);

  // Draw skeleton on canvas
  const drawSkeleton = useCallback((landmarkData: TimestampedLandmarks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !landmarkData.landmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    if (video) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showSkeleton) return;

    const lm = landmarkData.landmarks;
    const width = canvas.width;
    const height = canvas.height;

    // Draw connections
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (const [start, end] of POSE_CONNECTIONS) {
      if (start < lm.length && end < lm.length) {
        const startPoint = lm[start];
        const endPoint = lm[end];

        if (startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(startPoint.x * width, startPoint.y * height);
          ctx.lineTo(endPoint.x * width, endPoint.y * height);
          ctx.stroke();
        }
      }
    }

    // Draw landmarks
    for (let i = 0; i < lm.length; i++) {
      const point = lm[i];
      if (point.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw current rep score
    if (currentRepIndex >= 0 && currentRepIndex < repScores.length) {
      const score = repScores[currentRepIndex];
      ctx.fillStyle = getScoreColor(score.overall);
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${score.overall}%`, width - 20, 60);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Rep ${currentRepIndex + 1}`, width - 20, 90);
    }
  }, [showSkeleton, currentRepIndex, repScores]);

  // Update skeleton when time changes
  useEffect(() => {
    if (currentLandmarkIndex >= 0 && currentLandmarkIndex < landmarks.length) {
      drawSkeleton(landmarks[currentLandmarkIndex]);
    }
  }, [currentLandmarkIndex, landmarks, drawSkeleton]);

  // Video event handlers
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

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Exit fullscreen error:', err);
      }
    }
  };

  const handleDownload = () => {
    if (videoUrl || session.videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl || session.videoUrl || '';
      link.download = `${session.exerciseName}_${session.sessionDate}.webm`;
      link.click();
    }
  };

  const jumpToRep = (repIndex: number) => {
    if (repIndex < 0 || repIndex >= repScores.length) return;

    const repTimestamp = new Date(repScores[repIndex].timestamp).getTime();
    const sessionStart = new Date(session.sessionDate).getTime();
    const repTimeSeconds = (repTimestamp - sessionStart) / 1000;

    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, repTimeSeconds - 2); // 2 seconds before rep
      setCurrentTime(repTimeSeconds);
    }
    setSelectedRep(repIndex);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate average scores
  const avgScores = useMemo(() => {
    if (repScores.length === 0) {
      return { overall: 0, rom: 0, tempo: 0, symmetry: 0, depth: 0 };
    }

    const sum = repScores.reduce(
      (acc, r) => ({
        overall: acc.overall + r.overall,
        rom: acc.rom + r.breakdown.rom,
        tempo: acc.tempo + r.breakdown.tempo,
        symmetry: acc.symmetry + r.breakdown.symmetry,
        depth: acc.depth + r.breakdown.depth,
      }),
      { overall: 0, rom: 0, tempo: 0, symmetry: 0, depth: 0 }
    );

    const count = repScores.length;
    return {
      overall: Math.round(sum.overall / count),
      rom: Math.round(sum.rom / count),
      tempo: Math.round(sum.tempo / count),
      symmetry: Math.round(sum.symmetry / count),
      depth: Math.round(sum.depth / count),
    };
  }, [repScores]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/90">
        <div>
          <h2 className="text-white font-bold text-lg">{session.exerciseName}</h2>
          <p className="text-slate-400 text-sm">
            {new Date(session.sessionDate).toLocaleDateString('sv-SE')} - {repScores.length} reps
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video area */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-black flex items-center justify-center"
        >
          {(videoUrl || session.videoUrl) ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl || session.videoUrl}
                className="max-w-full max-h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ objectFit: 'contain' }}
              />
            </>
          ) : (
            // Skeleton-only playback (no video)
            <div className="w-full h-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="bg-slate-900 rounded-lg"
              />
              {landmarks.length === 0 && (
                <div className="absolute text-slate-400 text-center">
                  <Activity size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Ingen inspelning tillgänglig</p>
                </div>
              )}
            </div>
          )}

          {/* Overlay controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-sm w-12">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-2 bg-slate-600 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-cyan-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-white text-sm w-12">{formatTime(duration)}</span>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSkip(-10)}
                  className="p-2 text-white hover:text-cyan-400 transition-colors"
                  title="Bakåt 10s"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-3 bg-cyan-500 rounded-full text-white hover:bg-cyan-400 transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={() => handleSkip(10)}
                  className="p-2 text-white hover:text-cyan-400 transition-colors"
                  title="Framåt 10s"
                >
                  <SkipForward size={20} />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 text-white hover:text-cyan-400 transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeedChange}
                  className="px-3 py-1 bg-slate-700 rounded text-white text-sm hover:bg-slate-600 transition-colors"
                >
                  {playbackSpeed}x
                </button>
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    showSkeleton
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Skelett
                </button>
                {(videoUrl || session.videoUrl) && (
                  <button
                    onClick={handleDownload}
                    className="p-2 text-white hover:text-cyan-400 transition-colors"
                    title="Ladda ner"
                  >
                    <Download size={20} />
                  </button>
                )}
                <button
                  onClick={handleFullscreen}
                  className="p-2 text-white hover:text-cyan-400 transition-colors"
                  title="Fullskärm"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel - Rep details */}
        <div className="w-full lg:w-80 bg-slate-900 p-4 overflow-y-auto">
          {/* Session summary */}
          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">Sessionsöversikt</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800 rounded-lg p-3">
                <span className="text-2xl font-bold text-white">{avgScores.overall}%</span>
                <p className="text-slate-400 text-xs">Snittpoäng</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <span className="text-2xl font-bold text-cyan-400">{repScores.length}</span>
                <p className="text-slate-400 text-xs">Totalt reps</p>
              </div>
            </div>

            {/* Quality breakdown */}
            <div className="mt-4 space-y-2">
              {[
                { label: 'ROM', value: avgScores.rom, icon: <Target size={14} /> },
                { label: 'Tempo', value: avgScores.tempo, icon: <Zap size={14} /> },
                { label: 'Symmetri', value: avgScores.symmetry, icon: <Activity size={14} /> },
                { label: 'Djup', value: avgScores.depth, icon: <BarChart3 size={14} /> },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-slate-400">{item.icon}</span>
                  <span className="text-slate-300 text-sm flex-1">{item.label}</span>
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: getScoreColor(item.value),
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium w-10 text-right"
                    style={{ color: getScoreColor(item.value) }}
                  >
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rep list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold">Reps</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => jumpToRep(Math.max(0, (selectedRep ?? currentRepIndex) - 1))}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  disabled={repScores.length === 0}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => jumpToRep(Math.min(repScores.length - 1, (selectedRep ?? currentRepIndex) + 1))}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  disabled={repScores.length === 0}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {repScores.map((rep, index) => (
                <button
                  key={index}
                  onClick={() => jumpToRep(index)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    index === currentRepIndex || index === selectedRep
                      ? 'bg-cyan-500/20 border border-cyan-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Rep {index + 1}</span>
                    <span
                      className="font-bold"
                      style={{ color: getScoreColor(rep.overall) }}
                    >
                      {rep.overall}%
                    </span>
                  </div>
                  {rep.issues.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {rep.issues.slice(0, 2).map((issue, i) => (
                        <span
                          key={i}
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            issue.severity === 'high'
                              ? 'bg-red-500/20 text-red-400'
                              : issue.severity === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-slate-600 text-slate-300'
                          }`}
                        >
                          {issue.issue}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}

              {repScores.length === 0 && (
                <p className="text-slate-500 text-center py-4">
                  Inga reps registrerade
                </p>
              )}
            </div>
          </div>

          {/* Form issues summary */}
          {session.formIssues && session.formIssues.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-bold mb-3">Vanliga problem</h3>
              <div className="space-y-2">
                {Array.from(
                  session.formIssues.reduce((acc, issue) => {
                    acc.set(issue.issue, (acc.get(issue.issue) || 0) + 1);
                    return acc;
                  }, new Map<string, number>())
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([issue, count]) => (
                    <div
                      key={issue}
                      className="flex items-center justify-between bg-slate-800 rounded-lg p-2"
                    >
                      <span className="text-slate-300 text-sm">{issue}</span>
                      <span className="text-slate-500 text-sm">{count}x</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaybackViewer;
