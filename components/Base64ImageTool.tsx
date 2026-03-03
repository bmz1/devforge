import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Copy, X, ImageIcon, Check } from 'lucide-react';
import { Button } from './Button';

type Mode = 'encode' | 'decode';

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const Base64ImageTool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('encode');

  // Encode state
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [base64Output, setBase64Output] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Decode state
  const [base64Input, setBase64Input] = useState('');
  const [decodedPreview, setDecodedPreview] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Encode: handle file upload
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    setSourceFile(file);
    setSourcePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      setBase64Output(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearEncode = () => {
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    setSourceFile(null);
    setSourcePreview(null);
    setBase64Output('');
  };

  // Decode: handle base64 input
  const handleBase64Input = (value: string) => {
    setBase64Input(value);
    setDecodeError(null);

    if (!value.trim()) {
      setDecodedPreview(null);
      return;
    }

    // Accept both raw base64 and data URIs
    const dataUri = value.trim().startsWith('data:')
      ? value.trim()
      : `data:image/png;base64,${value.trim()}`;

    // Validate by loading as image
    const img = new window.Image();
    img.onload = () => {
      setDecodedPreview(dataUri);
      setDecodeError(null);
    };
    img.onerror = () => {
      setDecodedPreview(null);
      setDecodeError('Invalid base64 image data');
    };
    img.src = dataUri;
  };

  const downloadDecoded = () => {
    if (!decodedPreview) return;
    const link = document.createElement('a');
    link.href = decodedPreview;
    // Extract extension from data URI mime type
    const mimeMatch = decodedPreview.match(/data:image\/(\w+)/);
    const ext = mimeMatch ? mimeMatch[1] : 'png';
    link.download = `decoded-image.${ext}`;
    link.click();
  };

  const clearDecode = () => {
    setBase64Input('');
    setDecodedPreview(null);
    setDecodeError(null);
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Base64 Image</h2>
          <p className="text-slate-400 text-sm">Encode images to Base64 or decode Base64 to images.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={mode === 'encode' ? clearEncode : clearDecode}>
          <X size={16} className="mr-2" /> Clear
        </Button>
      </div>

      {/* Mode Toggle */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400 font-medium">Mode:</label>
          <div className="flex items-center bg-dark-800 rounded-lg border border-dark-700 p-1">
            <button
              onClick={() => setMode('encode')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'encode' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'decode' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Decode
            </button>
          </div>
        </div>
      </div>

      {mode === 'encode' ? (
        <>
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
              <p className="text-slate-500 text-sm">Supports PNG, JPG, GIF, SVG, WebP, and more</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}

          {/* Preview & Output */}
          {sourceFile && (
            <div className="flex flex-col gap-6">
              {/* Image Preview */}
              <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">{sourceFile.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{formatSize(sourceFile.size)}</span>
                </div>
                <div className="p-4 flex items-center justify-center min-h-[200px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjAyMDIwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyMDIwMjAiLz48L3N2Zz4=')]">
                  {sourcePreview && (
                    <img src={sourcePreview} alt="Source" className="max-w-full max-h-[300px] object-contain" />
                  )}
                </div>
              </div>

              {/* Base64 Output */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Base64 Data URI
                    <span className="ml-2 normal-case font-normal text-slate-600">
                      ({formatSize(base64Output.length)})
                    </span>
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="text-slate-500 hover:text-primary-400 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={base64Output}
                  className="w-full h-48 bg-dark-900 border border-dark-700 rounded-lg p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none"
                  placeholder="Base64 output will appear here..."
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Base64 Input */}
          <div className="group">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base64 Input</label>
            </div>
            <textarea
              value={base64Input}
              onChange={(e) => handleBase64Input(e.target.value)}
              className="w-full h-48 bg-dark-900 border border-dark-700 rounded-lg p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/10"
              placeholder="Paste a base64 data URI or raw base64 image string..."
            />
          </div>

          {/* Decode Error */}
          {decodeError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
              {decodeError}
            </div>
          )}

          {/* Decoded Preview */}
          {decodedPreview && (
            <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary-500" />
                  <span className="text-sm font-medium text-slate-300">Decoded Image</span>
                </div>
                <Button size="sm" onClick={downloadDecoded}>
                  <Download size={14} className="mr-2" /> Download
                </Button>
              </div>
              <div className="p-4 flex items-center justify-center min-h-[200px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjAyMDIwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyMDIwMjAiLz48L3N2Zz4=')]">
                <img src={decodedPreview} alt="Decoded" className="max-w-full max-h-[400px] object-contain" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
