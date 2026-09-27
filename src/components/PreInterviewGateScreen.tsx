import React, { useState, useEffect, useRef } from 'react';

interface PreInterviewGateScreenProps {
  candidateName: string;
  role: string;
  mode?: string;
  difficulty?: string;
  onEnterFullscreenAndStart: () => void | Promise<void>;
  onCancel: () => void;
}

export const PreInterviewGateScreen: React.FC<PreInterviewGateScreenProps> = ({
  candidateName,
  role,
  mode = 'Professional AI Interview',
  difficulty = 'Standard',
  onEnterFullscreenAndStart,
  onCancel,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Request camera + mic permissions and start live preview
  useEffect(() => {
    let mounted = true;

    const initMedia = async () => {
      setIsInitializing(true);
      setPermissionError(null);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: true,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(mediaStream);
        setCameraActive(mediaStream.getVideoTracks().length > 0);
        setMicActive(mediaStream.getAudioTracks().length > 0);

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = mediaStream;
        }

        // Set up real-time audio visualizer meter
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(mediaStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!mounted) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              // Map to 0..100 percentage
              const pct = Math.min(100, Math.round((avg / 80) * 100));
              setMicVolume(pct);
              animationFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch (audioErr) {
          console.warn('Audio metering notice:', audioErr);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Camera/Mic access error:', err);
          setPermissionError(
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'Camera & Microphone access was denied. Please allow permissions in your browser bar to attend the interview.'
              : 'Unable to access your camera/microphone. Please ensure another application is not using them.'
          );
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initMedia();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleStartClick = async () => {
    // Request fullscreen immediately in the exact user gesture
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen gesture call notification:', e);
    }

    // Stop the preview stream tracks here so the main room can seamlessly take over the webcam
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    // Transition to the live interview
    onEnterFullscreenAndStart();
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#FAF8F5] via-[#E5E1DD]/40 to-[#FAF8F5] flex flex-col items-center justify-center p-4 sm:p-6 text-[#083A4F]">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border-2 border-[#E5E1DD] overflow-hidden flex flex-col">
        {/* Top Header Badge */}
        <div className="bg-[#083A4F] text-[#E5E1DD] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#407E8C] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">videocam</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A58D66]">
                Step 1: Pre-Interview Gate Screen
              </span>
              <h1 className="text-lg font-bold text-white">Ready to Begin Your Interview</h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
              {role}
            </span>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Candidate Info Callout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E1DD]">
            <div>
              <div className="text-xs text-[#4F5B62] font-medium">Candidate Profile</div>
              <div className="font-bold text-base text-[#083A4F]">{candidateName}</div>
              <div className="text-xs text-[#407E8C]">Target Track: {role}</div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-[#083A4F]/5 text-[#083A4F] font-bold border border-[#083A4F]/20">
                Mode: {mode}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#A58D66]/15 text-[#083A4F] font-bold border border-[#A58D66]/30">
                Difficulty: {difficulty}
              </span>
            </div>
          </div>

          {/* Live Camera Preview Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#083A4F] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#407E8C] text-[18px]">
                  photo_camera
                </span>
                <span>Live Hardware Camera & Microphone Preview</span>
              </span>
              <span className="text-[#4F5B62]">Confirm you look and sound clear</span>
            </div>

            <div className="relative w-full aspect-video sm:aspect-21/9 bg-[#083A4F] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {/* Video Element */}
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  cameraActive ? 'block' : 'hidden'
                }`}
              />

              {/* Loading / Error States */}
              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#083A4F]/90 text-white space-y-2 p-4 text-center">
                  <span className="material-symbols-outlined text-[32px] animate-spin text-[#407E8C]">
                    refresh
                  </span>
                  <span className="text-sm font-semibold">Requesting Camera & Mic Access...</span>
                  <span className="text-xs text-[#E5E1DD]/80 max-w-sm">
                    Please click "Allow" on your browser permission prompt.
                  </span>
                </div>
              )}

              {permissionError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#083A4F] text-white p-6 text-center space-y-3">
                  <span className="material-symbols-outlined text-[36px] text-red-400">
                    videocam_off
                  </span>
                  <span className="text-sm font-bold text-red-300">{permissionError}</span>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-xl bg-[#407E8C] text-white text-xs font-bold hover:opacity-95 cursor-pointer shadow-sm"
                  >
                    Retry Permission
                  </button>
                </div>
              )}

              {/* Status Overlay Badges */}
              {cameraActive && (
                <>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Live Video Preview</span>
                    </span>
                  </div>

                  {/* Audio Volume Level Meter */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/70 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15 text-white text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#407E8C]">
                        {micVolume > 5 ? 'mic' : 'mic_none'}
                      </span>
                      <span className="text-[11px] font-medium">Mic Level:</span>
                      <div className="w-28 sm:w-44 h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-linear-to-r from-emerald-400 via-yellow-400 to-[#A58D66] rounded-full transition-all duration-75"
                          style={{ width: `${Math.max(4, micVolume)}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-[11px] text-[#E5E1DD] font-semibold">
                      {micVolume > 10 ? 'Audio Detected' : 'Speak to test mic'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Readiness Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E1DD] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                {cameraActive ? 'check_circle' : 'pending'}
              </span>
              <div>
                <span className="font-bold text-[#083A4F] block">Camera Feed</span>
                <span className="text-[#4F5B62] text-[11px]">
                  {cameraActive ? 'Face centered & clear' : 'Connecting...'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E1DD] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                {micActive ? 'check_circle' : 'pending'}
              </span>
              <div>
                <span className="font-bold text-[#083A4F] block">Microphone</span>
                <span className="text-[#4F5B62] text-[11px]">
                  {micActive ? 'Audio input verified' : 'Connecting...'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E1DD] flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#407E8C] text-[20px]">
                fullscreen
              </span>
              <div>
                <span className="font-bold text-[#083A4F] block">Proctor Lock</span>
                <span className="text-[#4F5B62] text-[11px]">Enforces fullscreen</span>
              </div>
            </div>
          </div>

          {/* Strict Single Action Button (Step 1 Requirement) */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              disabled={isInitializing || !cameraActive}
              onClick={handleStartClick}
              className="w-full py-4 rounded-2xl bg-[#083A4F] hover:bg-[#114b64] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-[#407E8C]"
            >
              <span className="material-symbols-outlined text-[24px]">fullscreen</span>
              <span>Enter Fullscreen & Start Interview</span>
            </button>

            <div className="flex items-center justify-between text-xs text-[#4F5B62] px-1">
              <span>Fullscreen is locked during the entire session for proctor integrity.</span>
              <button
                type="button"
                onClick={onCancel}
                className="text-[#407E8C] hover:underline font-semibold cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
