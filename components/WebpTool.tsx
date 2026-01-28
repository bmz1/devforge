import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, X, ImageIcon } from 'lucide-react';
import encode, { init as initWebpEncode } from '@jsquash/webp/encode';
import { Button } from './Button';

interface ConversionResult {
  blob: Blob;
  url: string;
  size: number;
}

export const WebpTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lossless, setLossless] = useState(true);
  const [quality, setQuality] = useState(80);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initWasm = async () => {
      try {
        await initWebpEncode({
          locateFile: (path: string) => {
            if (path.endsWith('.wasm')) {
              return '/webp_enc.wasm';
            }
            return path;
          }
        });
        setIsInitialized(true);
      } catch (err) {
        console.error('WebP init error:', err);
        setError('Failed to initialize WebP encoder');
      }
    };
    initWasm();
  }, []);

  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [sourcePreview, result]);

  const loadImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      img.src = objectUrl;
    });
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Cleanup previous
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    if (result?.url) URL.revokeObjectURL(result.url);

    setSourceFile(file);
    setSourcePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, [sourcePreview, result]);

  const convertToWebp = async () => {
    if (!sourceFile) return;
    if (!isInitialized) {
      setError('WebP encoder is still initializing, please wait...');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const imageData = await loadImageData(sourceFile);

      const webpBuffer = await encode(imageData, {
        lossless,
        quality: lossless ? 100 : quality,
      });

      const blob = new Blob([webpBuffer], { type: 'image/webp' });
      const url = URL.createObjectURL(blob);

      setResult({
        blob,
        url,
        size: blob.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadWebp = () => {
    if (!result || !sourceFile) return;

    const link = document.createElement('a');
    link.href = result.url;
    const baseName = sourceFile.name.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}.webp`;
    link.click();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearAll = () => {
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    if (result?.url) URL.revokeObjectURL(result.url);
    setSourceFile(null);
    setSourcePreview(null);
    setResult(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getSavingsPercent = () => {
    if (!sourceFile || !result) return null;
    const savings = ((sourceFile.size - result.size) / sourceFile.size) * 100;
    return savings;
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">WebP Converter</h2>
          <p className="text-slate-400 text-sm">Convert images to WebP format for smaller file sizes.</p>
        </div>
        {sourceFile && (
          <Button variant="secondary" size="sm" onClick={clearAll}>
            <X size={16} className="mr-2" /> Clear
          </Button>
        )}
      </div>

      {/* WASM Loading State */}
      {!isInitialized && !error && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Initializing WebP encoder...</span>
        </div>
      )}

      {/* Options */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400 font-medium">Mode:</label>
            <div className="flex items-center bg-dark-800 rounded-lg border border-dark-700 p-1">
              <button
                onClick={() => setLossless(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${lossless ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Lossless
              </button>
              <button
                onClick={() => setLossless(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!lossless ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Lossy
              </button>
            </div>
          </div>

          {!lossless && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-400 font-medium">Quality:</label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-24 accent-primary-600"
              />
              <span className="text-sm text-slate-300 w-8">{quality}%</span>
            </div>
          )}

          <div className="flex-1" />
          <p className="text-xs text-slate-500">
            {lossless ? 'Best for PNG/graphics' : 'Best for photos/JPG'}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!sourceFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-primary-500 bg-primary-600/10'
              : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/50'
            }
          `}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-slate-500'}`} />
          <p className="text-slate-300 font-medium mb-2">
            {isDragging ? 'Drop your image here' : 'Click or drag an image to upload'}
          </p>
          <p className="text-slate-500 text-sm">Supports PNG, JPG, GIF, BMP, and more</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {/* Preview & Result */}
      {sourceFile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Preview */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Original</span>
              </div>
              <span className="text-xs text-slate-500">{formatSize(sourceFile.size)}</span>
            </div>
            <div className="p-4 flex items-center justify-center min-h-[200px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjAyMDIwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyMDIwMjAiLz48L3N2Zz4=')]">
              {sourcePreview && (
                <img src={sourcePreview} alt="Source" className="max-w-full max-h-[300px] object-contain" />
              )}
            </div>
            <div className="px-4 py-3 border-t border-dark-700">
              <p className="text-xs text-slate-500 truncate">{sourceFile.name}</p>
            </div>
          </div>

          {/* Result Preview */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-primary-500" />
                <span className="text-sm font-medium text-slate-300">WebP Output</span>
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{formatSize(result.size)}</span>
                  {getSavingsPercent() !== null && (
                    <span className={`text-xs font-medium ${getSavingsPercent()! > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                      {getSavingsPercent()! > 0 ? '-' : '+'}{Math.abs(getSavingsPercent()!).toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-center min-h-[200px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjAyMDIwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyMDIwMjAiLz48L3N2Zz4=')]">
              {result ? (
                <img src={result.url} alt="WebP Result" className="max-w-full max-h-[300px] object-contain" />
              ) : (
                <div className="text-slate-500 text-sm">Click Convert to generate WebP</div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-dark-700 flex items-center justify-between gap-2">
              {!result ? (
                <Button onClick={convertToWebp} isLoading={isConverting} disabled={!isInitialized} className="w-full">
                  {isInitialized ? 'Convert to WebP' : 'Initializing...'}
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={convertToWebp} isLoading={isConverting} disabled={!isInitialized}>
                    Reconvert
                  </Button>
                  <Button onClick={downloadWebp}>
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
