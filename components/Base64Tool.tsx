import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Trash2, Copy } from 'lucide-react';
import { Button } from './Button';

export const Base64Tool: React.FC = () => {
  const [decoded, setDecoded] = useState('');
  const [encoded, setEncoded] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode'); // Logic actually runs both ways, but mode highlights the "active" input slightly
  
  const handleDecodedChange = (val: string) => {
    setDecoded(val);
    try {
      setEncoded(btoa(val));
    } catch (e) {
      setEncoded("Unable to encode (invalid character for Base64)");
    }
  };

  const handleEncodedChange = (val: string) => {
    setEncoded(val);
    try {
      setDecoded(atob(val));
    } catch (e) {
      // Don't clear decoded, just let it be stale or show partial? 
      // Better to show error or nothing.
      // For smooth typing, we might wait, but let's just show placeholder
    }
  };

  // Initialize with a sample
  useEffect(() => {
    handleDecodedChange('Hello World');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    setDecoded('');
    setEncoded('');
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Base64 Converter</h2>
          <p className="text-slate-400 text-sm">Encode and decode text in real-time.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={clear}><Trash2 size={14} className="mr-2"/> Clear All</Button>
      </div>

      <div className="flex flex-col gap-8 mt-4">
        {/* Decoded Input */}
        <div className="group">
           <div className="flex justify-between items-center mb-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plain Text</label>
             <button onClick={() => navigator.clipboard.writeText(decoded)} className="text-slate-500 hover:text-primary-400 transition-colors">
               <Copy size={14} />
             </button>
           </div>
           <textarea
             value={decoded}
             onChange={(e) => handleDecodedChange(e.target.value)}
             onFocus={() => setMode('encode')}
             className={`w-full h-48 bg-dark-900 border rounded-lg p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:ring-2 transition-all
                ${mode === 'encode' ? 'border-primary-500/50 ring-primary-500/10' : 'border-dark-700 focus:border-primary-500'}
             `}
             placeholder="Type plain text here..."
           />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700"></div>
          </div>
          <div className="relative bg-dark-800 px-4 text-slate-500">
            <ArrowLeftRight size={20} />
          </div>
        </div>

        {/* Encoded Input */}
        <div className="group">
           <div className="flex justify-between items-center mb-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base64 Encoded</label>
             <button onClick={() => navigator.clipboard.writeText(encoded)} className="text-slate-500 hover:text-primary-400 transition-colors">
               <Copy size={14} />
             </button>
           </div>
           <textarea
             value={encoded}
             onChange={(e) => handleEncodedChange(e.target.value)}
             onFocus={() => setMode('decode')}
             className={`w-full h-48 bg-dark-900 border rounded-lg p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:ring-2 transition-all
                ${mode === 'decode' ? 'border-primary-500/50 ring-primary-500/10' : 'border-dark-700 focus:border-primary-500'}
             `}
             placeholder="Type Base64 string here..."
           />
        </div>
      </div>
    </div>
  );
};