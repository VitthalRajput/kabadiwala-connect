import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, FlipHorizontal, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Scrap Material Photo',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to safely stop all media tracks
  const stopTracks = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start video stream from user media
  const startCamera = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    stopTracks();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('In-browser camera access is not supported on this browser.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please grant camera access or use the device camera option.'
          : 'Could not open live viewfinder. You can launch your device camera app directly.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      startCamera();
    } else {
      stopTracks();
    }

    return () => {
      stopTracks();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  // Toggle front / rear camera
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video onto canvas
  const handleShutter = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if using front user camera
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    stopTracks();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera();
  };

  // Confirm photo and create File
  const handleConfirm = () => {
    if (!capturedDataUrl) return;

    const arr = capturedDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const filename = `camera_scrap_${Date.now()}.jpg`;
    const file = new File([u8arr], filename, { type: mime });

    onCapture(file);
    stopTracks();
    onClose();
  };

  // Fallback handler for native device camera
  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
      stopTracks();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">{title}</h3>
              <p className="text-[11px] text-gray-500">Hold steady in good light for instant AI recognition</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Video or Preview Area */}
        <div className="relative flex-1 bg-black min-h-[350px] flex items-center justify-center overflow-hidden">
          {capturedDataUrl ? (
            /* Review captured snapshot */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/95">
              <img
                src={capturedDataUrl}
                alt="Captured scrap lot"
                className="w-full h-full max-h-[52vh] object-contain"
              />
              <div className="absolute top-3 left-3 bg-saffron-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Snapshot Ready for AI Scan
              </div>
            </div>
          ) : errorMsg ? (
            /* Error & fallback options */
            <div className="p-8 text-center text-white space-y-4 max-w-sm">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-xs text-gray-200 leading-relaxed">{errorMsg}</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => fileFallbackRef.current?.click()}
                className="w-full shadow-md font-bold"
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Launch Device Camera App
              </Button>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full max-h-[52vh] object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {/* Viewfinder Overlay / Guidelines */}
              <div className="absolute inset-6 border-2 border-dashed border-white/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/90 bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-md self-start">
                  AI Framing Area
                </span>
                <span className="text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full self-center text-center shadow-xs">
                  Center copper wires, motors, PCBs, or plastics
                </span>
              </div>

              {/* Switch front / rear camera button */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all shadow-md active:scale-95"
                title="Switch camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden Canvas & Native Camera Fallback */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileFallbackRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleNativeCapture}
          />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
          {capturedDataUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleRetake}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="flex-1 font-bold border-gray-300 hover:border-gray-400 tap-bounce"
              >
                Retake
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirm}
                leftIcon={<Check className="w-4 h-4" />}
                className="flex-1 font-bold shadow-md shadow-saffron-500/25 tap-bounce"
              >
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="text-xs text-saffron-700 hover:text-saffron-800 font-bold hover:underline px-2"
              >
                Open Camera App
              </button>

              {/* Big Shutter Button */}
              <button
                type="button"
                onClick={handleShutter}
                disabled={!!errorMsg || isLoading}
                className="w-16 h-16 rounded-full border-4 border-white bg-saffron-500 hover:bg-saffron-600 active:scale-95 disabled:opacity-40 transition-all shadow-xl flex items-center justify-center text-white ring-4 ring-saffron-300 tap-bounce"
                aria-label="Capture photo"
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-inner" />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopTracks();
                  onClose();
                }}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold px-2"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

