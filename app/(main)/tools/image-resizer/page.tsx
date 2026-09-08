'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, Download, Settings, RefreshCw, Lock, Unlock, AlertCircle } from 'lucide-react';

export default function ImageResizerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  
  // Resizing States
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [quality, setQuality] = useState<number>(0.8); // 0.1 to 1.0
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  
  // New State for active preset tracking
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Output State
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle File Upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setSelectedImage(imgUrl);

      // Load image to get original dimensions
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
        
        // Auto-process once loaded
        processImage(img.width, img.height, 0.8, 'image/jpeg', img);
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  // Process and Resize Image using Canvas
  const processImage = (
    newWidth: number, 
    newHeight: number, 
    q: number = quality, 
    f: string = format,
    sourceImg: HTMLImageElement | null = imgRef.current
  ) => {
    if (!sourceImg || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Fill white background for JPEGs (in case of transparent PNG to JPG conversion)
    if (f === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, newWidth, newHeight);
    }

    ctx.drawImage(sourceImg, 0, 0, newWidth, newHeight);

    const dataUrl = canvas.toDataURL(f, q);
    setOutputImage(dataUrl);

    // Calculate approximate size in bytes
    const base64str = dataUrl.split(',')[1];
    const decoded = atob(base64str);
    setOutputSize(decoded.length);
  };

  // Handle Dimension Changes
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const w = parseInt(e.target.value) || 0;
    setWidth(w);
    setSelectedPreset(null); // Clear preset if manually edited
    let h = height;
    if (lockAspectRatio && aspectRatio) {
      h = Math.round(w / aspectRatio);
      setHeight(h);
    }
    processImage(w, h);
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const h = parseInt(e.target.value) || 0;
    setHeight(h);
    setSelectedPreset(null); // Clear preset if manually edited
    let w = width;
    if (lockAspectRatio && aspectRatio) {
      w = Math.round(h * aspectRatio);
      setWidth(w);
    }
    processImage(w, h);
  };

  // Helper to format bytes to KB/MB
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetTool = () => {
    setSelectedImage(null);
    setOutputImage(null);
    setSelectedPreset(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // SSC Preset Application
  const applyPreset = (presetW: number, presetH: number, presetId: string) => {
    setLockAspectRatio(false);
    setWidth(presetW);
    setHeight(presetH);
    setSelectedPreset(presetId);
    processImage(presetW, presetH);
  };

  // Smart Warnings based on selected preset
  const isSignaturePreset = selectedPreset === 'ssc-signature';
  const sizeHasError = isSignaturePreset 
    ? (outputSize < 10240 || outputSize > 20480) 
    : (outputSize > 51200);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Hidden elements for processing */}
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      <canvas ref={canvasRef} className="hidden" />
      {selectedImage && <img ref={imgRef} src={selectedImage} alt="source" className="hidden" />}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white border border-slate-100 shadow-sm rounded-2xl mb-6">
            <img src="/media/New-logo.svg" alt="Calciprep" className="h-8 object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Exam Photo & Signature Resizer</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Resize and compress your documents locally on your device. Zero uploads to servers ensures your privacy. Perfect for SSC, Banking, and Railway form filling.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {!selectedImage ? (
          // UPLOAD STATE
          <div className="max-w-3xl mx-auto">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 bg-white hover:bg-blue-50 transition-colors rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer shadow-sm group"
            >
              <div className="bg-blue-100 text-blue-600 p-5 rounded-full mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload your Image</h3>
              <p className="text-slate-500 mb-8 text-center max-w-md">
                Drag and drop your passport photo or signature, or click to browse. We support JPG, PNG, and JPEG.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-all">
                Browse Files
              </button>
              
              <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
                <Lock size={14} /> 100% Secure. Images are processed directly in your browser.
              </div>
            </div>
          </div>
        ) : (
          // WORKSPACE STATE
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Panel: Preview */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Live Preview</h3>
                <button onClick={resetTool} className="text-sm font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition-colors">
                  <RefreshCw size={14} /> Start Over
                </button>
              </div>

              <div className="flex-1 w-full bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-[400px] p-4 relative">
                {/* Checkerboard background for transparent PNGs */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
                
                {outputImage && (
                  <img 
                    src={outputImage} 
                    alt="Processed Preview" 
                    className="max-w-full max-h-[500px] object-contain relative z-10 drop-shadow-md"
                  />
                )}
              </div>

              <div className="w-full mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Original Size</p>
                  <p className="text-lg font-semibold text-slate-700">{formatBytes(originalSize)}</p>
                </div>
                <div className={`${sizeHasError ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-100'} border rounded-xl p-4 transition-colors`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${sizeHasError ? 'text-rose-500' : 'text-blue-500'}`}>New Size</p>
                  <p className={`text-xl font-bold ${sizeHasError ? 'text-rose-600' : 'text-blue-700'}`}>
                    {formatBytes(outputSize)}
                  </p>
                  {sizeHasError && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> 
                      {isSignaturePreset ? 'Must be between 10 KB to 20 KB' : 'Over typical 50 KB limit'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Controls */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Quick Presets */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Settings size={18} className="text-blue-600" /> Government Exam Presets
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => applyPreset(413, 531, 'ssc-photo')} 
                    className={`text-left p-3 border rounded-xl transition-all ${selectedPreset === 'ssc-photo' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'}`}
                  >
                    <p className="font-bold text-sm text-slate-800">SSC Photo</p>
                    <p className="text-xs text-slate-500 mt-0.5">3.5cm x 4.5cm</p>
                  </button>
                  <button 
                    onClick={() => applyPreset(708, 236, 'ssc-signature')} 
                    className={`text-left p-3 border rounded-xl transition-all ${selectedPreset === 'ssc-signature' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'}`}
                  >
                    <p className="font-bold text-sm text-slate-800">SSC Signature</p>
                    <p className="text-xs text-slate-500 mt-0.5">6.0cm x 2.0cm</p>
                  </button>
                </div>
              </div>

              {/* Dimensions Control */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Dimensions (Pixels)</h3>
                  <button 
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`p-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${lockAspectRatio ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {lockAspectRatio ? <Lock size={14} /> : <Unlock size={14} />} 
                    {lockAspectRatio ? 'Locked' : 'Unlocked'}
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Width</label>
                    <input 
                      type="number" 
                      value={width} 
                      onChange={handleWidthChange}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="text-slate-400 font-bold mt-5">X</div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Height</label>
                    <input 
                      type="number" 
                      value={height} 
                      onChange={handleHeightChange}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Compression & Format Control */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Format & File Size</h3>
                
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                  <button 
                    onClick={() => { setFormat('image/jpeg'); processImage(width, height, quality, 'image/jpeg'); }}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${format === 'image/jpeg' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    JPG / JPEG
                  </button>
                  <button 
                    onClick={() => { setFormat('image/png'); processImage(width, height, 1, 'image/png'); }}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${format === 'image/png' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    PNG
                  </button>
                </div>

                {format === 'image/jpeg' && (
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700">Compression Quality</label>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{Math.round(quality * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.05" 
                      value={quality}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setQuality(val);
                        processImage(width, height, val);
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[11px] text-slate-500 mt-2">Adjust the slider to strictly meet the {isSignaturePreset ? '10KB - 20KB' : '50KB'} size limit.</p>
                  </div>
                )}
              </div>

              {/* Download Action */}
              <button 
                onClick={() => {
                  if (!outputImage) return;
                  const link = document.createElement('a');
                  link.href = outputImage;
                  link.download = `Calciprep_Resized_${fileName.replace(/\.[^/.]+$/, "")}.${format === 'image/jpeg' ? 'jpg' : 'png'}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <Download size={20} /> Download Image
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}