
import React, { useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Finding {
  ruleId: string;
  message: string;
  location?: {
    file?: string;
    line?: number;
  };
}

interface AnalysisResult {
  status: string;
  findingsCount: number;
  findings: Finding[];
  note?: string;
  error?: string;
  message?: string;
}

export function CodeSecurityAnalysis() {
  const [code, setCode] = useState(
    'import hashlib\n\ndef store_password(password):\n    return hashlib.md5(password.encode()).hexdigest()'
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter Python code to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/code-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data: AnalysisResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Analysis failed.');
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the CodeQL service.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#0F172A] rounded-xl shadow-md border border-slate-800/80 p-5">
        <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
          Static Analysis Engine
        </h2>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span>Code Security Analysis (CodeQL)</span>
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Scan Python source code for security vulnerabilities, weak hashes, and injection vectors using your connected CodeQL service.
        </p>
      </div>

      {/* Code Editor Container */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0F172A] p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between font-mono">
          <label
            htmlFor="python-source"
            className="text-xs font-semibold text-slate-200 flex items-center gap-2"
          >
            <span>Python Source Code:</span>
            <span className="text-[10px] text-cyan-400 font-normal">Python 3.x</span>
          </label>
          <span className="text-[11px] text-slate-500">{code.length} characters</span>
        </div>

        <textarea
          id="python-source"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={8}
          placeholder="Paste your Python code here..."
          className="w-full resize-y rounded-lg border border-slate-800 bg-[#080D1A] p-4 font-mono text-xs text-emerald-400 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 leading-relaxed transition-colors shadow-inner"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800 font-mono">
          <p className="text-[11px] text-slate-500">
            Python only · Maximum 50 KB payload
          </p>

          <button
            onClick={analyzeCode}
            disabled={loading || !code.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-900/40 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search className="h-3.5 w-3.5" />
            {loading ? 'Analyzing Source Code...' : 'Analyze Code with CodeQL'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-cyan-500/40 bg-[#0F172A] p-4 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>CodeQL is analyzing your code. Running semantic security query suite...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs font-mono text-rose-300 shadow-md">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#0F172A] p-5 shadow-md font-mono">
            <div className="flex items-center gap-3">
              {result.findingsCount > 0 ? (
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}

              <div>
                <h3 className="font-bold text-sm text-white">
                  Analysis {result.status}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {result.findingsCount} security finding(s) detected
                </p>
              </div>
            </div>

            <span className="rounded-md bg-[#111A2E] border border-cyan-500/30 px-3 py-1 text-xs font-bold text-cyan-300">
              CodeQL Connected
            </span>
          </div>

          {result.findings.map((finding, index) => (
            <div
              key={`${finding.ruleId}-${index}`}
              className="rounded-xl border border-amber-500/30 bg-[#0F172A] p-5 shadow-md space-y-3 font-mono"
            >
              <div className="grid grid-cols-1 gap-3 border-b border-slate-800 pb-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <span className="text-xs font-bold text-cyan-300 break-all leading-relaxed">
                  {finding.ruleId}
                </span>
                <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                  Security Finding
                </span>
              </div>

              <p className="break-words text-xs leading-relaxed text-slate-200 font-sans bg-[#080D1A] p-3 rounded-lg border border-slate-800">
                {finding.message.replace(/\]\((\d+)\)/g, ']')}
              </p>

              <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 text-[11px] leading-relaxed text-slate-400 sm:grid-cols-2">
                <span>File: <code className="text-cyan-400">{finding.location?.file || 'Unknown'}</code></span>
                <span>Line: <code className="text-cyan-400">{finding.location?.line ?? 'Unknown'}</code></span>
              </div>
            </div>
          ))}

          {result.findingsCount === 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-[#0F172A] p-5 text-xs text-emerald-300 font-mono shadow-md flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>No vulnerabilities reported by the configured CodeQL query suite.</span>
            </div>
          )}

          {result.note && (
            <p className="text-xs text-slate-500 font-mono">{result.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
