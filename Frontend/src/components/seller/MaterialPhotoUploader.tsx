import React, { useState, useRef } from 'react';
import { UploadCloud, X, Sparkles, Camera } from 'lucide-react';
import { CameraModal } from '../common/CameraModal';

interface MaterialPhotoUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  onAnalyzeImage?: (file: File) => void;
  isAnalyzing?: boolean;
}

export const MaterialPhotoUploader: React.FC<MaterialPhotoUploaderProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  onAnalyzeImage,
  isAnalyzing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Handle files selected from device
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const combined = [...files, ...selected].slice(0, maxFiles);
    onFilesChange(combined);

    // If first time uploading image and analyzer available, trigger classification
    if (onAnalyzeImage && files.length === 0 && selected[0]) {
      onAnalyzeImage(selected[0]);
    }
  };

  // Handle drag and drop files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    const dropped = Array.from(e.dataTransfer.files);
    const combined = [...files, ...dropped].slice(0, maxFiles);
    onFilesChange(combined);

    if (onAnalyzeImage && files.length === 0 && dropped[0]) {
      onAnalyzeImage(dropped[0]);
    }
  };

  // Handle photo captured from CameraModal
  const handleCameraCapture = (capturedFile: File) => {
    const combined = [...files, capturedFile].slice(0, maxFiles);
    onFilesChange(combined);

    // Process photo directly through AI classification as requested
    if (onAnalyzeImage) {
      onAnalyzeImage(capturedFile);
    }
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Quick Camera Button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          Material Photos <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {files.length}/{maxFiles} photos
          </span>
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            disabled={files.length >= maxFiles}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white rounded-full font-bold text-xs shadow-xs transition-all tap-bounce cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Open Camera</span>
          </button>
        </div>
      </div>

      {/* Dual Options Grid: Open Camera + Upload from Device */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Open Camera Card */}
        <div
          onClick={() => {
            if (files.length < maxFiles) setIsCameraOpen(true);
          }}
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group hover-elevate ${
            files.length >= maxFiles
              ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
              : 'border-saffron-400 hover:border-saffron-500 bg-gradient-to-br from-saffron-50/60 to-amber-50/30 hover:bg-saffron-50/80'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-saffron-500 text-white flex items-center justify-center mb-3 shadow-md shadow-saffron-500/25 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-extrabold text-gray-900">
            Take Photo with Camera
          </h4>
          <p className="text-xs text-gray-600 mt-1 max-w-[220px]">
            Click a live photo using phone/webcam for instant AI material scan
          </p>
          <button
            type="button"
            disabled={files.length >= maxFiles}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-saffron-300 text-saffron-700 group-hover:bg-saffron-600 group-hover:text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{files.length >= maxFiles ? 'Max Photos Reached' : 'Open Camera'}</span>
          </button>
        </div>

        {/* Option 2: Upload from Device (Existing Drag & Drop) */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => {
            if (files.length < maxFiles) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group hover-elevate ${
            files.length >= maxFiles
              ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-saffron-400 bg-gray-50/50 hover:bg-saffron-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={files.length >= maxFiles}
          />
          <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-saffron-100 text-gray-600 group-hover:text-saffron-600 flex items-center justify-center mb-3 transition-colors group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-extrabold text-gray-900">
            Upload from Device
          </h4>
          <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
            Drag & drop or browse image files from your computer or phone
          </p>
          <span className="mt-3.5 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 group-hover:text-saffron-600">
            JPG, PNG, WEBP up to 5MB
          </span>
        </div>
      </div>

      {/* Thumbnails Preview List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">Selected Scrap Photos:</span>
            <span>First photo will be analyzed by AI</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {files.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              const isFirst = idx === 0;

              return (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-50 shadow-xs hover:border-saffron-400 transition-colors"
                >
                  <img
                    src={previewUrl}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {isFirst && (
                    <span className="absolute bottom-1.5 left-1.5 bg-saffron-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Primary / AI
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors opacity-80 group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual AI Re-Scan Button */}
      {files.length > 0 && onAnalyzeImage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-saffron-50/80 border border-saffron-200 text-xs animate-fade-in">
          <div className="flex items-center gap-2.5 text-saffron-900 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-saffron-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-gray-900">AI Material Classification</p>
              <p className="text-[11px] text-gray-600">Automatic scan runs on the primary scrap photo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAnalyzeImage(files[0])}
            disabled={isAnalyzing}
            className="px-3.5 py-1.5 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 tap-bounce cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Scan</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Snap Scrap Photo with Camera"
      />
    </div>
  );
};
