/**
 * ROM Assessment Component
 * Guides patients through camera-based Range of Motion tests
 * Uses existing MediaPipe + PoseReconstructor infrastructure
 *
 * OPTIMIZATION: MediaPipe is lazily loaded only when camera starts
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, SkipForward, Camera, Check, AlertCircle, Play, Pause, RotateCcw, ChevronRight, Activity, Loader2 } from 'lucide-react';
import type { Pose, Results, POSE_CONNECTIONS } from '@mediapipe/pose';
import type { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { loadMediaPipeModules, MediaPipeModules, preloadMediaPipe } from '../services/lazyMediaPipe';
import { PoseReconstructor, getPoseReconstructor, JointAngle3D } from '../services/poseReconstruction';
import { PoseLandmark } from '../services/calibrationService';
import { BaselineROM, JointROMData, ROMTestResult, ROMTestDefinition } from '../types';
import { logger } from '../utils/logger';
import { saveROMToHistory } from '../services/romTrackingService';

// ROM Test definitions with normal ranges
const ROM_TESTS: ROMTestDefinition[] = [
  {
    id: 'knee_flexion',
    name: 'Knäböjning',
    joint: 'knee',
    instruction: 'Stå stadigt och böj knäna så långt du kan utan smärta. Håll ryggen rak.',
    normalRange: { min: 120, max: 150 },
    ageAdjustment: { '18-40': 0, '41-60': -5, '60+': -15 }
  },
  {
    id: 'hip_flexion',
    name: 'Höftböjning',
    joint: 'hip',
    instruction: 'Stå på ett ben och lyft det andra benet framåt så högt du kan.',
    normalRange: { min: 100, max: 130 },
    ageAdjustment: { '18-40': 0, '41-60': -5, '60+': -20 }
  },
  {
    id: 'shoulder_flexion',
    name: 'Axellyft framåt',
    joint: 'shoulderFlexion',
    instruction: 'Lyft båda armarna rakt fram och upp över huvudet så långt du kan.',
    normalRange: { min: 150, max: 180 },
    ageAdjustment: { '18-40': 0, '41-60': -10, '60+': -20 }
  },
  {
    id: 'shoulder_abduction',
    name: 'Axellyft åt sidan',
    joint: 'shoulderAbduction',
    instruction: 'Lyft båda armarna åt sidorna och upp över huvudet.',
    normalRange: { min: 150, max: 180 },
    ageAdjustment: { '18-40': 0, '41-60': -10, '60+': -20 }
  }
];

interface ROMAssessmentProps {
  onComplete: (results: BaselineROM) => void;
  onSkip: () => void;
  patientAge?: number;
  injuryLocation?: string;
}

type AssessmentPhase = 'intro' | 'calibrating' | 'testing' | 'pain_check' | 'complete';

const ROMAssessment: React.FC<ROMAssessmentProps> = ({
  onComplete,
  onSkip,
  patientAge,
  injuryLocation
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const reconstructorRef = useRef<PoseReconstructor>(getPoseReconstructor());
  const peakAnglesRef = useRef<Record<string, { left: number; right: number }>>({});
  const measurementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaPipeModulesRef = useRef<MediaPipeModules | null>(null);

  // State
  const [phase, setPhase] = useState<AssessmentPhase>('intro');
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [currentAngles, setCurrentAngles] = useState<Record<string, number>>({});
  const [testResults, setTestResults] = useState<ROMTestResult[]>([]);
  const [painReported, setPainReported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingML, setIsLoadingML] = useState(false);

  const currentTest = ROM_TESTS[currentTestIndex];

  // Get age group for adjustments
  const getAgeGroup = (): '18-40' | '41-60' | '60+' => {
    if (!patientAge) return '18-40';
    if (patientAge <= 40) return '18-40';
    if (patientAge <= 60) return '41-60';
    return '60+';
  };

  // Filter tests based on injury location
  const getRelevantTests = useCallback((): ROMTestDefinition[] => {
    if (!injuryLocation) return ROM_TESTS;

    const location = injuryLocation.toLowerCase();

    if (location.includes('knä')) {
      return ROM_TESTS.filter(t => t.id === 'knee_flexion' || t.id === 'hip_flexion');
    }
    if (location.includes('höft')) {
      return ROM_TESTS.filter(t => t.id === 'hip_flexion' || t.id === 'knee_flexion');
    }
    if (location.includes('axel') || location.includes('arm')) {
      return ROM_TESTS.filter(t => t.id.includes('shoulder'));
    }
    if (location.includes('rygg') || location.includes('nacke')) {
      return ROM_TESTS.filter(t => t.id.includes('shoulder') || t.id === 'hip_flexion');
    }

    return ROM_TESTS;
  }, [injuryLocation]);

  const relevantTests = getRelevantTests();

  // Initialize MediaPipe Pose - LAZY LOADED
  useEffect(() => {
    if (phase !== 'testing' && phase !== 'calibrating') return;

    const initializePose = async () => {
      try {
        setIsLoadingML(true);

        // Dynamically load MediaPipe modules (only ~1.6MB when actually needed)
        const modules = await loadMediaPipeModules();
        mediaPipeModulesRef.current = modules;

        const { poseLib, cameraUtils } = modules;
        const Pose = poseLib.Pose;
        const pose = new Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults(handlePoseResults);
        poseRef.current = pose;

        // Start camera
        if (videoRef.current) {
          const Camera = cameraUtils.Camera;
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current && !isPaused) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          await camera.start();
          cameraRef.current = camera;
        }

        setIsLoadingML(false);
      } catch (error) {
        logger.error('ROM Assessment - Camera error:', error);
        setCameraError('Kunde inte starta kameran. Kontrollera att du har gett tillåtelse.');
        setIsLoadingML(false);
      }
    };

    initializePose();

    return () => {
      cameraRef.current?.stop();
      poseRef.current?.close();
    };
  }, [phase, isPaused]);

  // Handle pose detection results
  const handlePoseResults = useCallback((results: Results) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw camera feed
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // Draw pose landmarks using lazy-loaded modules
    const modules = mediaPipeModulesRef.current;
    if (modules) {
      const { poseLib, drawingUtils } = modules;
      const DrawingUtils = drawingUtils.drawConnectors;
      DrawingUtils(ctx, results.poseLandmarks, poseLib.POSE_CONNECTIONS, {
        color: '#00FF88',
        lineWidth: 2
      });
      drawingUtils.drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0088',
        lineWidth: 1,
        radius: 3
      });
    }

    ctx.restore();

    // Calculate joint angles
    const landmarks = results.poseLandmarks as PoseLandmark[];
    const angles = reconstructorRef.current.calculateJointAngles(landmarks);

    // Update current angles display
    const displayAngles: Record<string, number> = {};
    Object.entries(angles).forEach(([key, value]) => {
      displayAngles[key] = Math.round(value.angle);
    });
    setCurrentAngles(displayAngles);

    // Track peak angles during capture
    if (isCapturing && currentTest) {
      trackPeakAngles(angles);
    }
  }, [isCapturing, currentTest]);

  // Track peak angles during measurement
  const trackPeakAngles = (angles: Record<string, JointAngle3D>) => {
    const joint = currentTest.joint;

    let leftAngle = 0;
    let rightAngle = 0;

    if (joint === 'knee') {
      // Knee flexion is 180 - angle (straight leg = 180, bent = lower)
      leftAngle = 180 - (angles.leftKnee?.angle || 180);
      rightAngle = 180 - (angles.rightKnee?.angle || 180);
    } else if (joint === 'hip') {
      // Hip flexion
      leftAngle = 180 - (angles.leftHip?.angle || 180);
      rightAngle = 180 - (angles.rightHip?.angle || 180);
    } else if (joint === 'shoulderFlexion') {
      // Shoulder flexion (arm raised forward)
      leftAngle = angles.leftShoulderFlexion?.angle || 0;
      rightAngle = angles.rightShoulderFlexion?.angle || 0;
    } else if (joint === 'shoulderAbduction') {
      // Shoulder abduction (arm raised to side)
      leftAngle = angles.leftShoulderAbduction?.angle || 0;
      rightAngle = angles.rightShoulderAbduction?.angle || 0;
    }

    const testId = currentTest.id;
    const current = peakAnglesRef.current[testId] || { left: 0, right: 0 };

    peakAnglesRef.current[testId] = {
      left: Math.max(current.left, leftAngle),
      right: Math.max(current.right, rightAngle)
    };
  };

  // Start measurement for current test
  const startMeasurement = () => {
    setCountdown(3);

    // Countdown before capture
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          beginCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Begin actual capture
  const beginCapture = () => {
    peakAnglesRef.current[currentTest.id] = { left: 0, right: 0 };
    setIsCapturing(true);
    setCaptureProgress(0);

    // Capture for 5 seconds
    const captureStart = Date.now();
    const captureInterval = setInterval(() => {
      const elapsed = Date.now() - captureStart;
      const progress = Math.min(100, (elapsed / 5000) * 100);
      setCaptureProgress(progress);

      if (elapsed >= 5000) {
        clearInterval(captureInterval);
        finishCapture();
      }
    }, 100);

    measurementTimeoutRef.current = captureInterval as unknown as NodeJS.Timeout;
  };

  // Finish capture and record result
  const finishCapture = () => {
    setIsCapturing(false);
    setCaptureProgress(0);

    const peaks = peakAnglesRef.current[currentTest.id];
    const ageGroup = getAgeGroup();
    const adjustment = currentTest.ageAdjustment?.[ageGroup] || 0;
    const adjustedMax = currentTest.normalRange.max + adjustment;

    const symmetry = Math.min(peaks.left, peaks.right) > 0
      ? (Math.min(peaks.left, peaks.right) / Math.max(peaks.left, peaks.right)) * 100
      : 100;

    const result: ROMTestResult = {
      testId: currentTest.id,
      testName: currentTest.name,
      measuredValue: {
        left: Math.round(peaks.left),
        right: Math.round(peaks.right),
        symmetry: Math.round(symmetry)
      },
      normalRange: { min: currentTest.normalRange.min, max: adjustedMax },
      percentOfNormal: Math.round(((peaks.left + peaks.right) / 2) / adjustedMax * 100),
      painReported: false,
      timestamp: new Date().toISOString()
    };

    setTestResults(prev => [...prev, result]);
    setPhase('pain_check');
  };

  // Handle pain check response
  const handlePainResponse = (hadPain: boolean) => {
    // Update last result with pain info
    setTestResults(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].painReported = hadPain;
      }
      return updated;
    });

    if (hadPain) {
      setPainReported(true);
    }

    // Move to next test or complete
    if (currentTestIndex < relevantTests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
      setPhase('testing');
    } else {
      setPhase('complete');
    }
  };

  // Skip current test
  const skipCurrentTest = () => {
    if (currentTestIndex < relevantTests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
    } else {
      setPhase('complete');
    }
  };

  // Complete assessment and return results
  const completeAssessment = () => {
    const baseline: BaselineROM = {
      assessmentDate: new Date().toISOString(),
      painDuringTest: painReported,
      testsCompleted: testResults.map(r => r.testId),
      measurementQuality: testResults.length >= 3 ? 'good' : testResults.length >= 2 ? 'fair' : 'poor',
      calibrationUsed: false
    };

    // Map results to baseline structure
    testResults.forEach(result => {
      const data: JointROMData = result.measuredValue;

      switch (result.testId) {
        case 'knee_flexion':
          baseline.kneeFlexion = data;
          break;
        case 'hip_flexion':
          baseline.hipFlexion = data;
          break;
        case 'shoulder_flexion':
          baseline.shoulderFlexion = data;
          break;
        case 'shoulder_abduction':
          baseline.shoulderAbduction = data;
          break;
      }
    });

    // Generate AI observations
    const observations: string[] = [];
    testResults.forEach(result => {
      if (result.measuredValue.symmetry < 85) {
        observations.push(`Asymmetri noterad i ${result.testName} (${result.measuredValue.symmetry}%)`);
      }
      if (result.percentOfNormal < 70) {
        observations.push(`Begränsad rörlighet i ${result.testName} (${result.percentOfNormal}% av normalt)`);
      }
    });
    if (observations.length > 0) {
      baseline.aiObservations = observations;
    }

    // Save to history for trend tracking
    saveROMToHistory(baseline);

    onComplete(baseline);
  };

  // Render intro phase
  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Activity className="w-16 h-16 text-blue-500 mb-4" />
      <h2 className="text-2xl font-bold mb-4">Rörlighetsmätning med kamera</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Vi kommer att mäta din rörlighet i några enkla rörelser med hjälp av kameran.
        Detta tar cirka 2-3 minuter och hjälper oss skapa ett bättre program för dig.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md">
        <h3 className="font-semibold text-blue-800 mb-2">Förberedelser:</h3>
        <ul className="text-sm text-blue-700 text-left space-y-1">
          <li>• Ställ dig 2-3 meter från kameran</li>
          <li>• Se till att hela kroppen syns</li>
          <li>• Ha bra belysning</li>
          <li>• Bär bekväma kläder</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onSkip}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Hoppa över
        </button>
        <button
          onClick={() => setPhase('calibrating')}
          onMouseEnter={preloadMediaPipe} // Preload ML on hover for faster startup
          className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Starta kameran
        </button>
      </div>
    </div>
  );

  // Render calibrating/camera setup phase
  const renderCalibrating = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full"
        />

        {/* Loading indicator for ML modules */}
        {isLoadingML && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-4">
              <Loader2 className="w-12 h-12 mx-auto mb-2 text-blue-400 animate-spin" />
              <p>Laddar AI-modeller...</p>
              <p className="text-sm text-gray-400 mt-1">Detta kan ta några sekunder</p>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-4">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
              <p>{cameraError}</p>
            </div>
          </div>
        )}

        {!isLoadingML && !cameraError && (
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-2 rounded text-white text-sm">
            Positionera dig så att hela kroppen syns
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Hoppa över
        </button>
        <button
          onClick={() => {
            setCurrentTestIndex(0);
            setPhase('testing');
          }}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          disabled={!!cameraError}
        >
          <Check className="w-5 h-5" />
          Jag är redo
        </button>
      </div>
    </div>
  );

  // Render testing phase
  const renderTesting = () => {
    const test = relevantTests[currentTestIndex];
    if (!test) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Progress bar */}
        <div className="bg-gray-100 px-4 py-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Test {currentTestIndex + 1} av {relevantTests.length}</span>
            <span>{test.name}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${((currentTestIndex) / relevantTests.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Camera view */}
        <div className="flex-1 relative bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-8xl font-bold text-white">{countdown}</div>
            </div>
          )}

          {/* Capture progress */}
          {isCapturing && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${captureProgress}%` }}
              />
            </div>
          )}

          {/* Real-time angle display */}
          <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-xl text-sm min-w-[140px]">
            {isCapturing ? (
              <div className="space-y-2">
                <div className="text-green-400 font-semibold text-center mb-2">Mäter...</div>
                {peakAnglesRef.current[test.id] && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vänster:</span>
                      <span className="font-mono text-lg">{Math.round(peakAnglesRef.current[test.id].left)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Höger:</span>
                      <span className="font-mono text-lg">{Math.round(peakAnglesRef.current[test.id].right)}°</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <div className="text-xs text-gray-400 text-center">Normal: {test.normalRange.min}-{test.normalRange.max}°</div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-gray-300 mb-1">Klicka starta</div>
                <div className="text-xs text-gray-500">Normal: {test.normalRange.min}-{test.normalRange.max}°</div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions and controls */}
        <div className="bg-white p-4 border-t">
          <p className="text-center text-gray-700 mb-4">{test.instruction}</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={skipCurrentTest}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <SkipForward className="w-4 h-4" />
              Hoppa över
            </button>

            {!isCapturing && countdown === null && (
              <button
                onClick={startMeasurement}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Starta mätning
              </button>
            )}

            {isCapturing && (
              <button
                onClick={() => {
                  if (measurementTimeoutRef.current) {
                    clearInterval(measurementTimeoutRef.current);
                  }
                  finishCapture();
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                Avsluta mätning
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render pain check phase
  const renderPainCheck = () => {
    const lastResult = testResults[testResults.length - 1];
    if (!lastResult) return null;

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <Check className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-xl font-bold mb-2">{lastResult.testName} klar!</h2>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{lastResult.measuredValue.left}°</div>
              <div className="text-sm text-gray-500">Vänster</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{lastResult.measuredValue.right}°</div>
              <div className="text-sm text-gray-500">Höger</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Symmetri: {lastResult.measuredValue.symmetry}%
          </div>
        </div>

        <p className="text-gray-600 mb-4">Upplevde du smärta under rörelsen?</p>

        <div className="flex gap-4">
          <button
            onClick={() => handlePainResponse(true)}
            className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            Ja, det gjorde ont
          </button>
          <button
            onClick={() => handlePainResponse(false)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Nej, ingen smärta
          </button>
        </div>
      </div>
    );
  };

  // Render complete phase
  const renderComplete = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="bg-green-100 rounded-full p-4 mb-4">
        <Check className="w-16 h-16 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Rörlighetsmätning klar!</h2>
      <p className="text-gray-600 mb-6">
        Vi har nu en baslinmätning av din rörlighet som hjälper oss
        följa dina framsteg.
      </p>

      {testResults.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-4 mb-6 w-full max-w-md">
          <h3 className="font-semibold mb-3">Resultat:</h3>
          <div className="space-y-2">
            {testResults.map((result, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-700">{result.testName}</span>
                <span className="font-mono">
                  {result.measuredValue.left}° / {result.measuredValue.right}°
                  {result.painReported && (
                    <AlertCircle className="w-4 h-4 text-orange-500 inline ml-1" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={completeAssessment}
        className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
      >
        Fortsätt
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Rörlighetsmätning</h1>
        <button
          onClick={onSkip}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Stäng"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {phase === 'intro' && renderIntro()}
        {phase === 'calibrating' && renderCalibrating()}
        {phase === 'testing' && renderTesting()}
        {phase === 'pain_check' && renderPainCheck()}
        {phase === 'complete' && renderComplete()}
      </div>
    </div>
  );
};

export default ROMAssessment;
