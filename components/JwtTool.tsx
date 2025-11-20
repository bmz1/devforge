import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Info, CheckCircle, Sparkles } from 'lucide-react';
import { DecodedJwt } from '../types';
import { Button } from './Button';
import { explainJwtClaims } from '../services/gemini';

export const JwtTool: React.FC = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Basic decoder without external lib for zero-dependency if possible, but let's be robust.
  // Using simple atob with utf8 fix for simplicity in this demo.
  const decodeSection = (str: string) => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!token) {
      setDecoded(null);
      setError(null);
      setAiExplanation(null);
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setError("Invalid JWT format. Expected 3 parts separated by dots.");
      setDecoded(null);
      return;
    }

    const header = decodeSection(parts[0]);
    const payload = decodeSection(parts[1]);

    if (!header || !payload) {
       setError("Could not decode Base64 sections. Token might be malformed.");
       setDecoded(null);
       return;
    }

    setError(null);
    setDecoded({
      header,
      payload,
      signature: parts[2],
      raw: { header: parts[0], payload: parts[1], signature: parts[2] }
    });
    // Reset AI explanation on new valid token
    setAiExplanation(null);
  }, [token]);

  const handleAiExplain = async () => {
    if (!decoded) return;
    setIsAnalyzing(true);
    const result = await explainJwtClaims(JSON.stringify(decoded.payload, null, 2));
    setAiExplanation(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">JWT Debugger</h2>
          <p className="text-slate-400 text-sm">Decode and inspect JSON Web Tokens.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 shadow-lg flex flex-col h-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Encoded Token</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={`w-full flex-1 bg-dark-800 border border-dark-700 rounded-lg p-4 font-mono text-xs text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 break-all
                ${error ? 'border-red-500/50' : ''}
              `}
              placeholder="Paste JWT here (ey...)"
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {decoded ? (
            <>
               {/* Header */}
               <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
                 <div className="bg-dark-800 px-4 py-2 border-b border-dark-700 flex justify-between items-center">
                   <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Header</span>
                   <span className="text-xs text-slate-500 font-mono">ALGORITHM & TOKEN TYPE</span>
                 </div>
                 <pre className="p-4 text-sm font-mono text-red-300 overflow-x-auto">
                   {JSON.stringify(decoded.header, null, 2)}
                 </pre>
               </div>

               {/* Payload */}
               <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden flex-1">
                 <div className="bg-dark-800 px-4 py-2 border-b border-dark-700 flex justify-between items-center">
                   <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Payload</span>
                   <div className="flex items-center gap-3">
                     <span className="text-xs text-slate-500 font-mono">DATA & CLAIMS</span>
                     <button 
                       onClick={handleAiExplain}
                       disabled={isAnalyzing}
                       className="flex items-center gap-1 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-2 py-1 rounded transition-colors"
                     >
                       <Sparkles size={10} />
                       {isAnalyzing ? 'Analyzing...' : 'AI Explain'}
                     </button>
                   </div>
                 </div>
                 <div className="relative">
                   <pre className="p-4 text-sm font-mono text-purple-300 overflow-x-auto">
                     {JSON.stringify(decoded.payload, null, 2)}
                   </pre>
                   
                   {/* AI Explanation Overlay or Insert */}
                   {aiExplanation && (
                     <div className="mx-4 mb-4 p-4 bg-dark-800 rounded-lg border border-purple-500/20 animate-fade-in">
                       <h4 className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2">
                         <Info size={12} /> Security Insights
                       </h4>
                       <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                         {aiExplanation}
                       </p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Signature */}
               <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
                 <div className="bg-dark-800 px-4 py-2 border-b border-dark-700 flex justify-between items-center">
                   <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Signature</span>
                 </div>
                 <div className="p-4 text-xs font-mono text-cyan-300 break-all opacity-70">
                   HMACSHA256(<br/>
                   &nbsp;&nbsp;base64UrlEncode(header) + "." +<br/>
                   &nbsp;&nbsp;base64UrlEncode(payload),<br/>
                   &nbsp;&nbsp;secret<br/>
                   )
                 </div>
               </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-dark-900/50 rounded-xl border border-dark-700/50 border-dashed">
               <ShieldCheck size={48} className="mb-4 opacity-50" />
               <p>Enter a valid JWT to decode details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};