import React, { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from './Button';

export const UuidTool: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateUUID = () => {
    // Fallback for older browsers if crypto.randomUUID is missing
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  };

  const handleGenerate = () => {
    const newIds = Array.from({ length: quantity }, () => generateUUID());
    setUuids(newIds);
  };

  // Generate initial on mount
  React.useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">UUID Generator</h2>
          <p className="text-slate-400 text-sm">Generate Version 4 UUIDs instantly.</p>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-6 mb-8">
           <div className="flex items-center gap-3">
             <label className="text-sm text-slate-400 font-medium">Quantity:</label>
             <div className="flex items-center bg-dark-800 rounded-lg border border-dark-700 p-1">
               {[1, 5, 10, 20].map(num => (
                 <button
                   key={num}
                   onClick={() => setQuantity(num)}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${quantity === num ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                   {num}
                 </button>
               ))}
             </div>
           </div>
           <div className="flex-1"></div>
           <Button onClick={handleGenerate}>
             <RefreshCw size={16} className="mr-2" /> Generate
           </Button>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {uuids.map((uuid, idx) => (
            <div 
              key={`${uuid}-${idx}`} 
              className="group flex items-center justify-between bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg p-3 transition-all"
            >
              <span className="font-mono text-slate-200 text-sm md:text-base">{uuid}</span>
              <button 
                onClick={() => copyToClipboard(uuid, idx)}
                className="p-2 rounded-md hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
                title="Copy"
              >
                {copiedIndex === idx ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            </div>
          ))}
        </div>
        
        {uuids.length > 1 && (
          <div className="mt-4 flex justify-end">
             <Button variant="ghost" size="sm" onClick={copyAll}>Copy All</Button>
          </div>
        )}
      </div>
    </div>
  );
};