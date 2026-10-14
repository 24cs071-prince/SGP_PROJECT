
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
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Code Security Analysis
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Analyze Python source code using your connected CodeQL service.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="python-source"
          className="mb-3 block text-sm font-semibold text-slate-800"
        >
          Python Source Code
        </label>

        <textarea
          id="python-source"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          placeholder="Paste your Python code here..."
          className="min-h-64 w-full resize-y rounded-lg border border-slate-300 bg-slate-950 p-4 font-mono text-sm text-green-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Python only · Maximum 50 KB
          </p>

          <button
            onClick={analyzeCode}
            disabled={loading || !code.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          CodeQL is analyzing your code. Please wait...
        </div>
      )}

      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              {result.findingsCount > 0 ? (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              )}

              <div>
                <h3 className="font-bold text-slate-900">
                  Analysis {result.status}
                </h3>
                <p className="text-sm text-slate-600">
                  {result.findingsCount} finding(s) detected
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              CodeQL
            </span>
          </div>

          {result.findings.map((finding, index) => (
            <div
              key={`${finding.ruleId}-${index}`}
              className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {finding.ruleId}
                </span>
                <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                  Security Finding
                </span>
              </div>

              <p className="mt-3 break-words text-sm leading-6 text-slate-700">
                {finding.message.replace(/\]\((\d+)\)/g, ']')}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>File: {finding.location?.file || 'Unknown'}</span>
                <span>Line: {finding.location?.line ?? 'Unknown'}</span>
              </div>
            </div>
          ))}

          {result.findingsCount === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              No findings were reported by the configured CodeQL query.
            </div>
          )}

          {result.note && (
            <p className="text-xs text-slate-500">{result.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
