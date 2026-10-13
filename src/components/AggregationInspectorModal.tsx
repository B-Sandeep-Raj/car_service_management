import React, { useState } from 'react';
import { X, Code2, Play, CheckCircle2, Copy, Sparkles, Terminal } from 'lucide-react';
import type { AggregationPipelineDoc } from '../types/index';
import { api } from '../services/apiClient';

interface AggregationInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelines: AggregationPipelineDoc[];
  initialSelectedKey?: string;
}

export const AggregationInspectorModal: React.FC<AggregationInspectorModalProps> = ({
  isOpen,
  onClose,
  pipelines,
  initialSelectedKey,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialSelectedKey || (pipelines[0]?.key ?? ''));
  const [copied, setCopied] = useState(false);

  // Custom runner state
  const [activeTab, setActiveTab] = useState<'inspect' | 'sandbox'>('inspect');
  const [sandboxCollection, setSandboxCollection] = useState<string>('Services');
  const [sandboxCode, setSandboxCode] = useState<string>(
    JSON.stringify(
      [
        { $match: { status: 'Completed' } },
        {
          $group: {
            _id: '$serviceType',
            count: { $sum: 1 },
            avgCost: { $avg: '$actualCost' }
          }
        },
        { $sort: { count: -1 } }
      ],
      null,
      2
    )
  );
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPipeline = pipelines.find(p => p.key === selectedKey) || pipelines[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSandbox = async () => {
    setSandboxLoading(true);
    setSandboxError(null);
    try {
      const parsedPipeline = JSON.parse(sandboxCode);
      if (!Array.isArray(parsedPipeline)) {
        throw new Error('Pipeline must be a valid JSON array of stage objects.');
      }
      const res = await api.runCustomPipeline(sandboxCollection, parsedPipeline);
      setSandboxResult(res);
    } catch (err: any) {
      setSandboxError(err.message || 'Execution error');
      setSandboxResult(null);
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                MongoDB Aggregation Pipeline Inspector & Sandbox
              </h2>
              <p className="text-xs text-slate-400">
                Inspect authentic multi-stage pipelines: $match, $lookup, $unwind, $group, $project, $sort
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('inspect')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'inspect' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Inspect 9 Pipelines
              </button>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'sandbox' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Interactive Sandbox
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'inspect' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar list of pipelines */}
            <div className="w-72 border-r border-slate-800 bg-slate-950/50 p-3 overflow-y-auto space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Standard Pipelines ({pipelines.length})
              </div>
              {pipelines.map((pipe) => {
                const isSelected = pipe.key === selectedKey;
                return (
                  <button
                    key={pipe.key}
                    onClick={() => setSelectedKey(pipe.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <div className="truncate font-medium">{pipe.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Stages: {pipe.pipeline?.length || 0}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pipeline details & JSON display */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-900">
              {currentPipeline ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                          {currentPipeline.key}
                        </span>
                        <h3 className="text-lg font-semibold text-slate-100">
                          {currentPipeline.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {currentPipeline.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(JSON.stringify(currentPipeline.pipeline, null, 2))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied Pipeline' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  {/* Stage breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Execution Stages Breakdown ({currentPipeline.pipeline?.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentPipeline.pipeline?.map((stage: any, idx: number) => {
                        const stageOperator = Object.keys(stage)[0] || '$unknown';
                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                          >
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                              <span className="font-mono font-semibold text-amber-400">{stageOperator}</span>
                              <span className="text-[10px]">Stage #{idx + 1}</span>
                            </div>
                            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-24 scrollbar-thin">
                              {JSON.stringify(stage[stageOperator], null, 2)}
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Complete Raw Pipeline JSON */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Full Aggregation Pipeline Array</span>
                      <span className="text-[11px] text-slate-400 font-mono">db.collection.aggregate([ ... ])</span>
                    </h4>
                    <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60">
                      {JSON.stringify(currentPipeline.pipeline, null, 2)}
                    </pre>
                  </div>

                  {/* Pipeline Output Data Sample */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Aggregated Result Documents ({currentPipeline.data?.length || 0})</span>
                      <span className="text-[10px] text-emerald-400">Live query executed against MongoDB engine</span>
                    </h4>
                    <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto max-h-56">
                      {JSON.stringify(currentPipeline.data, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No pipeline selected.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Interactive Sandbox Tab */
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-300">Target MongoDB Collection:</label>
                <select
                  value={sandboxCollection}
                  onChange={(e) => setSandboxCollection(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Services">Services (28 documents)</option>
                  <option value="Cars">Cars (16 documents)</option>
                  <option value="Customers">Customers (12 documents)</option>
                  <option value="Mechanics">Mechanics (6 documents)</option>
                  <option value="SpareParts">SpareParts (25 documents)</option>
                  <option value="Bills">Bills (24 documents)</option>
                  <option value="ServiceHistory">ServiceHistory (28 documents)</option>
                </select>
              </div>

              <button
                onClick={handleRunSandbox}
                disabled={sandboxLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{sandboxLoading ? 'Executing Query...' : 'Execute Aggregation'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" /> Pipeline Stages (JSON Array)
                  </span>
                  <button
                    onClick={() => {
                      setSandboxCode(JSON.stringify([
                        { $group: { _id: '$brand', count: { $sum: 1 }, avgMileage: { $avg: '$mileage' } } },
                        { $sort: { count: -1 } }
                      ], null, 2));
                      setSandboxCollection('Cars');
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Load Cars Preset
                  </button>
                </div>
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
                  spellCheck={false}
                />
              </div>

              {/* Output */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Execution Result</span>
                  {sandboxResult && (
                    <span className="text-[11px] text-emerald-400">
                      Returned {sandboxResult.count} document(s)
                    </span>
                  )}
                </div>

                {sandboxError ? (
                  <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 font-mono h-[300px] overflow-y-auto">
                    {sandboxError}
                  </div>
                ) : (
                  <pre className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-sky-300 overflow-y-auto h-[300px]">
                    {sandboxResult ? JSON.stringify(sandboxResult.result, null, 2) : '// Click "Execute Aggregation" to run your query on MongoDB'}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MongoDB Query Language (MQL) pipelines compliant with MongoDB 6.0+ aggregation specifications.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
