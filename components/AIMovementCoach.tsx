
import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw, CheckCircle2, Maximize2, RotateCcw, Play } from 'lucide-react';
import { Pose, POSE_CONNECTIONS, Results } from '@mediapipe/pose';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

interface AIMovementCoachProps {
  exerciseName: string;
  videoUrl?: string; // URL for the instruction video
  onClose: () => void;
}

const AIMovementCoach: React.FC<AIMovementCoachProps> = ({ exerciseName, videoUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [feedback, setFeedback] = useState("Ställ dig så hela kroppen syns");
  const [reps, setReps] = useState(0);
  const [formScore, setFormScore] = useState(100);
  const [squatState, setSquatState] = useState<'up' | 'down'>('up');
  
  // Angle calculation helper
  const calculateAngle = (a: any, b: any, c: any) => {
      const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs(radians * 180.0 / Math.PI);
      if (angle > 180.0) angle = 360 - angle;
      return angle;
  };

  const onResults = (results: Results) => {
    if (!canvasRef.current || !videoRef.current || !results.poseLandmarks) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // Draw the video frame
    canvasCtx.drawImage(results.image, 0, 0, width, height);

    // 1. ANALYZE SQUAT (Example Logic)
    // Landmarks: 23=Left Hip, 25=Left Knee, 27=Left Ankle
    const landmarks = results.poseLandmarks;
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    let lineColor = '#00FF00'; // Green default
    let lineWidth = 4;

    if (leftHip && leftKnee && leftAnkle && leftHip.visibility > 0.5) {
        const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
        
        // State Machine for Rep Counting
        if (angle > 160) {
            setSquatState('up');
            setFeedback("Redo. Böj knäna.");
        } 
        else if (angle < 100 && squatState === 'up') {
            setSquatState('down');
            setFeedback("Bra djup! Vänd upp.");
            lineColor = '#00FFFF'; // Cyan for good depth
        }
        else if (angle > 160 && squatState === 'down') {
            setSquatState('up');
            setReps(prev => prev + 1);
            setFeedback("Snygg rep!");
        }
        else if (squatState === 'down' && angle > 100) {
             setFeedback("Pressa upp!");
        }

        // Draw Angle Text
        canvasCtx.font = "30px Arial";
        canvasCtx.fillStyle = "white";
        canvasCtx.fillText(Math.round(angle) + "°", leftKnee.x * width + 20, leftKnee.y * height);
    } else {
        setFeedback("Backa så hela kroppen syns");
        lineColor = '#FF0000'; // Red if not tracking
    }

    // 2. DRAW SKELETON
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#FFFFFF', lineWidth: 2 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { 
        color: lineColor, 
        lineWidth: 2,
        radius: (data) => data.visibility && data.visibility > 0.5 ? 4 : 0 
    });
    
    canvasCtx.restore();
  };

  useEffect(() => {
    const pose = new Pose({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }});

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults(onResults);

    if (videoRef.current) {
      const camera = new MediaPipeCamera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
             await pose.send({image: videoRef.current});
          }
        },
        width: 1280,
        height: 720
      });
      camera.start().then(() => setIsCameraActive(true));
      
      return () => {
          camera.stop();
          pose.close();
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT/TOP: INSTRUCTION VIDEO */}
      <div className="h-1/3 md:h-full md:w-1/2 bg-black relative border-b md:border-b-0 md:border-r border-slate-700">
          <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/10 flex items-center gap-2">
              <Play size={12} className="text-red-500 fill-current" /> Instruktion
          </div>
          {videoUrl ? (
              <iframe 
                src={`${videoUrl}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('/').pop()}`}
                className="w-full h-full object-cover opacity-80"
                allow="autoplay; encrypted-media"
              ></iframe>
          ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <p>Ingen instruktionsvideo tillgänglig</p>
              </div>
          )}
      </div>

      {/* RIGHT/BOTTOM: AI CAMERA */}
      <div className="h-2/3 md:h-full md:w-1/2 relative bg-slate-900 flex flex-col">
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
             <div>
                <h3 className="text-white font-bold text-lg drop-shadow-md">{exerciseName}</h3>
                <div className="flex items-center gap-2 mt-1">
                    {!isCameraActive ? (
                        <span className="text-amber-400 text-xs font-bold flex items-center gap-1"><RefreshCw className="animate-spin" size={10} /> Startar kamera...</span>
                    ) : (
                        <span className="text-green-400 text-xs font-bold flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Live Analys</span>
                    )}
                </div>
             </div>
             <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/10">
                <X size={24} />
             </button>
          </div>

          {/* Camera Canvas */}
          <div className="relative flex-grow flex items-center justify-center overflow-hidden">
             <video ref={videoRef} className="hidden" playsInline muted></video>
             <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
                width={1280} 
                height={720}
             ></canvas>
             
             {/* Rep Counter Overlay */}
             <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col items-center gap-1">
                 <div className="text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-mono">{reps}</div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">Reps</div>
             </div>
          </div>

          {/* Feedback Footer */}
          <div className="p-6 bg-slate-900 border-t border-slate-800">
             <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors duration-300 ${
                 feedback.includes("Bra") || feedback.includes("Snygg") 
                 ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                 : 'bg-slate-800 border-slate-700 text-white'
             }`}>
                 <div className="flex items-center gap-3">
                     {feedback.includes("Bra") ? <CheckCircle2 size={24} /> : <Maximize2 size={24} />}
                     <span className="font-bold text-lg">{feedback}</span>
                 </div>
                 <button onClick={() => setReps(0)} className="text-slate-500 hover:text-white transition-colors" title="Nollställ">
                    <RotateCcw size={20} />
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default AIMovementCoach;
