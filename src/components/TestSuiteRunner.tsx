import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Award,
  AlertTriangle,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { TestSuiteItem } from '../types';
import { getTestSuiteApi, runTestSuiteApi } from '../lib/api';

export const TestSuiteRunner: React.FC = () => {
  const [tests, setTests] = useState<TestSuiteItem[]>([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<{
    passedCount: number;
    failedCount: number;
    total: number;
    accuracyPercent: number;
    falsePositiveCount: number;
    falseNegativeCount: number;
  } | null>(null);

  const fetchTests = async () => {
    try {
      const data = await getTestSuiteApi();
      setTests(data);
    } catch (err) {
      console.error('Failed to load test suite', err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const data = await runTestSuiteApi();
      setTests(data.results);
      setSummary({
        passedCount: data.passedCount,
        failedCount: data.failedCount,
        total: data.total,
        accuracyPercent: data.accuracyPercent,
        falsePositiveCount: data.falsePositiveCount,
        falseNegativeCount: data.falseNegativeCount,
      });
    } catch (err) {
      console.error('Failed to run test suite', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* High Density Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] rounded-xl shadow-md border border-slate-800/80 p-5">
        <div>
          <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
            Validation Harness
          </h2>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span>Automated Benchmark Matrix & Verification Suite</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Executes PRD benchmark suite: Safe queries, Direct overrides, Jailbreaks, and Encoded attacks.
          </p>
        </div>

        <button
          id="run-all-tests-btn"
          onClick={handleRunTests}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/40 transition-all cursor-pointer self-start disabled:opacity-50 font-mono"
        >
          {running ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Executing Matrix...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Full Evaluation Suite</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Scorecard */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Overall Accuracy</div>
            <div className="text-2xl font-black text-emerald-400">{summary.accuracyPercent}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
              {summary.passedCount} of {summary.total} tests passed
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">False Positives (FPR)</div>
            <div className="text-2xl font-black text-white">{summary.falsePositiveCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">Legitimate queries blocked</div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">False Negatives (FNR)</div>
            <div className="text-2xl font-black text-rose-400">{summary.falseNegativeCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">Attacks missed by engine</div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Classification</div>
            <div className="text-2xl font-black text-cyan-400">
              {summary.accuracyPercent >= 90 ? 'PASSED (A+)' : 'TUNING_NEEDED'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">Meets PRD threshold targets</div>
          </div>
        </div>
      )}

      {/* Test Matrix List Styled as High Density Milestone Cards */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl overflow-hidden shadow-md p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
              Test Registry
            </h2>
            <h3 className="font-bold text-sm text-white">
              Benchmark Test Cases ({tests.length} vectors)
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => {
            const hasResult = !!test.lastResult;
            const passed = test.lastResult?.passed;

            return (
              <div
                key={test.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3.5 rounded-lg border transition-all ${
                  hasResult
                    ? passed
                      ? 'border-l-4 border-l-emerald-500 border-slate-800 bg-[#080D1A]'
                      : 'border-l-4 border-l-rose-500 border-slate-800 bg-[#080D1A]'
                    : 'border-l-4 border-l-slate-700 border-slate-800 bg-[#080D1A]'
                }`}
              >
                <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0">
                  {/* Milestone-style Index Box */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                      hasResult
                        ? passed
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-[#111A2E] text-slate-400 border-slate-700/80'
                    }`}
                  >
                    T{index + 1}
                  </div>

                  {/* Outcome badge on mobile top right */}
                  <div className="sm:hidden text-right font-mono">
                    {hasResult ? (
                      <div className="flex items-center gap-2">
                        {passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>PASS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase">
                            <XCircle className="h-3 w-3" />
                            <span>FAIL</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">
                          {test.lastResult?.score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-white">{test.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                        test.category === 'SAFE'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : test.category === 'OBVIOUS_INJECTION'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : test.category === 'ENCODED'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {test.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      Target: <span className="text-cyan-400">{test.expectedAction}</span>
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 bg-[#050913] p-2.5 rounded border border-slate-800/90 truncate leading-relaxed">
                    "{test.prompt}"
                  </p>
                  <p className="text-[11px] text-slate-400">{test.description}</p>
                </div>

                {/* Outcome badge on desktop */}
                <div className="hidden sm:block shrink-0 text-right font-mono">
                  {hasResult ? (
                    <div className="space-y-1">
                      {passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase">
                          <XCircle className="h-3 w-3" />
                          <span>FAIL</span>
                        </span>
                      )}
                      <div className="text-[10px] text-slate-400 font-semibold">
                        Score: <span className="text-slate-200 font-bold">{test.lastResult?.score}/100</span> ({test.lastResult?.latencyMs}ms)
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
