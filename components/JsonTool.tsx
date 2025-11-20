import React, { useState, useCallback } from 'react';
import { Copy, Trash2, Minimize2, Maximize2, Play, Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { generateJsonAnalysis } from '../services/gemini';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Recursive Tree Component
const JsonNode = ({ name, value, depth = 0, isLast }: { name?: string; value: any; depth?: number; isLast?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const type = isArray ? 'array' : typeof value;
  const size = isObject ? Object.keys(value).length : 0;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (!isObject) {
    let renderValue = String(value);
    let colorClass = "text-orange-400"; // string
    if (type === 'number') colorClass = "text-blue-400";
    if (type === 'boolean') colorClass = "text-purple-400";
    if (value === null) colorClass = "text-slate-500";

    if (type === 'string') renderValue = `"${value}"`;

    return (
      <div className="font-mono text-sm hover:bg-white/5 pl-2 rounded">
        <span className="text-slate-400 select-none">{"  ".repeat(depth)}</span>
        {name && <span className="text-cyan-400">{name}: </span>}
        <span className={`${colorClass} break-all`}>{renderValue}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  return (
    <div className="font-mono text-sm">
      <div 
        className="flex items-center cursor-pointer hover:bg-white/5 rounded pl-2 py-0.5 select-none"
        onClick={toggle}
      >
        <span className="text-slate-400 mr-1">{"  ".repeat(depth)}</span>
        <span className="text-slate-500 mr-1 w-4 h-4 flex items-center justify-center">
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {name && <span className="text-cyan-400 mr-1">{name}: </span>}
        <span className="text-slate-300">{isArray ? '[' : '{'}</span>
        {!isExpanded && (
          <span className="text-slate-500 text-xs ml-2">
             {size} items ... {isArray ? ']' : '}'} {!isLast && ','}
          </span>
        )}
      </div>
      
      {isExpanded && (
        <div>
          {Object.entries(value).map(([key, val], index, arr) => (
            <JsonNode 
              key={key} 
              name={isArray ? undefined : key} 
              value={val} 
              depth={depth + 1} 
              isLast={index === arr.length - 1}
            />
          ))}
          <div className="pl-2 hover:bg-white/5 rounded">
             <span className="text-slate-400">{"  ".repeat(depth)}</span>
             <span className="text-slate-300">{isArray ? ']' : '}'}</span>
             {!isLast && <span className="text-slate-500">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export const JsonTool: React.FC = () => {
  const [input, setInput] = useState('{"name": "DevForge", "version": 1.0, "features": ["JSON", "Base64", "JWT"], "active": true}');
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'code' | 'tree'>('code');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initial parse
  React.useEffect(() => {
    try {
      const p = JSON.parse(input);
      setParsed(p);
      setError(null);
    } catch (e) {
      // Only set error if we explicitly validate, or keep quiet during typing until format is clicked
      // We'll set parsed to null to indicate invalid state for tree view
      setParsed(null);
    }
  }, [input]);

  const formatJson = () => {
    try {
      const obj = JSON.parse(input);
      setInput(JSON.stringify(obj, null, 2));
      setError(null);
      setParsed(obj);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const minifyJson = () => {
    try {
      const obj = JSON.parse(input);
      setInput(JSON.stringify(obj));
      setError(null);
      setParsed(obj);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const clear = () => {
    setInput('');
    setParsed(null);
    setError(null);
    setAiAnalysis(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
  };

  const handleAnalyze = async () => {
    if (!parsed) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await generateJsonAnalysis(JSON.stringify(parsed));
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const getStats = useCallback(() => {
    if (!parsed) return [];
    const counts: Record<string, number> = { String: 0, Number: 0, Boolean: 0, Object: 0, Array: 0 };
    
    const traverse = (obj: any) => {
      if (Array.isArray(obj)) {
        counts.Array++;
        obj.forEach(traverse);
      } else if (obj !== null && typeof obj === 'object') {
        counts.Object++;
        Object.values(obj).forEach(traverse);
      } else if (typeof obj === 'string') counts.String++;
      else if (typeof obj === 'number') counts.Number++;
      else if (typeof obj === 'boolean') counts.Boolean++;
    };
    
    traverse(parsed);
    return Object.entries(counts)
      .filter(([, val]) => val > 0)
      .map(([name, value]) => ({ name, value }));
  }, [parsed]);

  const statsData = getStats();

  return (
    <div className="flex flex-col h-full gap-6 p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">JSON Processor</h2>
          <p className="text-slate-400 text-sm">Format, validate, and inspect JSON data.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm" onClick={clear}><Trash2 size={14} className="mr-2"/> Clear</Button>
           <Button variant="secondary" size="sm" onClick={copyToClipboard}><Copy size={14} className="mr-2"/> Copy</Button>
           <Button variant="secondary" size="sm" onClick={minifyJson}><Minimize2 size={14} className="mr-2"/> Minify</Button>
           <Button variant="primary" size="sm" onClick={formatJson}><Maximize2 size={14} className="mr-2"/> Format</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input Section */}
        <div className="flex flex-col gap-2 min-h-[500px]">
          <div className="flex justify-between items-center">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input JSON</span>
             {error && <span className="text-xs text-red-400 animate-pulse">{error}</span>}
          </div>
          <div className="relative flex-1 group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full h-full bg-dark-900 border rounded-lg p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:ring-2 transition-all
                ${error ? 'border-red-500/50 focus:ring-red-500/20' : 'border-dark-700 focus:ring-primary-500/20 focus:border-primary-500'}
              `}
              placeholder="Paste your JSON here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output/Visualization Section */}
        <div className="flex flex-col gap-2 min-h-[500px]">
          <div className="flex justify-between items-center">
            <div className="flex bg-dark-700 rounded-md p-1">
              <button 
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors ${viewMode === 'code' ? 'bg-dark-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Tree View
              </button>
              <button 
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors ${viewMode === 'tree' ? 'bg-dark-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Stats & AI
              </button>
            </div>
             
            {viewMode === 'tree' && (
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleAnalyze} 
                isLoading={isAnalyzing}
                disabled={!parsed}
                className="text-primary-400 hover:text-primary-300"
               >
                 <Sparkles size={14} className="mr-2" /> Generate Types
               </Button>
            )}
          </div>

          <div className="flex-1 bg-dark-900 border border-dark-700 rounded-lg overflow-hidden flex flex-col relative">
            {/* Render Logic */}
            {parsed ? (
              viewMode === 'code' ? (
                <div className="flex-1 overflow-auto p-4">
                  <JsonNode value={parsed} isLast={true} />
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-6 space-y-8">
                   {/* Stats Chart */}
                   <div className="h-64 w-full">
                      <h3 className="text-sm font-medium text-slate-400 mb-4">Data Structure Distribution</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                            itemStyle={{ color: '#f8fafc' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>

                   {/* AI Analysis */}
                   {aiAnalysis && (
                     <div className="animate-fade-in bg-dark-800 rounded-lg border border-primary-500/20 p-4">
                       <div className="flex items-center gap-2 mb-3 text-primary-400">
                         <Sparkles size={16} />
                         <h3 className="font-semibold text-sm">AI Analysis</h3>
                       </div>
                       <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                         {aiAnalysis}
                       </pre>
                     </div>
                   )}
                </div>
              )
            ) : (
               <div className="flex-1 flex items-center justify-center text-slate-600">
                 {error ? (
                   <span className="text-red-500 opacity-75">Invalid JSON</span>
                 ) : (
                   <span>Enter valid JSON to view</span>
                 )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};