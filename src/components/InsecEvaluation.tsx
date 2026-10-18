import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Layers,
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Play,
  RefreshCw,
  Terminal,
  XCircle,
  Loader2,
} from 'lucide-react';

interface InsecSummary {
  baseline_vul_ratio: number;
  init_vul_ratio: number;
  opt_vul_ratio: number;
}

interface InsecResults {
  epoch: number;
  eval_summary: InsecSummary;
  test_summary: InsecSummary;
}

type RunState = 'idle' | 'running' | 'completed' | 'failed';

interface RunStatus {
  state: RunState;
  message: string;
  startedAt?: string;
  finishedAt?: string;
  log: string[];
}

const initialStatus: RunStatus = {
  state: 'idle',
  message: 'Checking evaluation status...',
  log: [],
};

export const InsecEvaluation: React.FC = () => {
  const [data, setData] = useState<InsecResults | null>(null);
  const [error, setError] = useState('');
  const [runStatus, setRunStatus] = useState<RunStatus>(initialStatus);
  const [runError, setRunError] = useState('');
  const lastState = useRef<RunState | null>(null);

  const loadResults = useCallback(async () => {
    const response = await fetch('/api/insec-results');

    if (!response.ok) {
      throw new Error('Failed to load INSEC results.');
    }

    const result: InsecResults = await response.json();

    if (!result?.eval_summary || !result?.test_summary) {
      throw new Error('Invalid INSEC results format.');
    }

    setData(result);
    setError('');
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/insec-status');

      if (!response.ok) {
        throw new Error('Could not retrieve evaluation status.');
      }

      const status: RunStatus = await response.json();

      setRunStatus(status);
      setRunError('');

      if (
        status.state === 'completed' &&
        lastState.current !== 'completed'
      ) {
        try {
          await loadResults();
        } catch (err: unknown) {
          setError(
            err instanceof Error
              ? err.message
              : 'Evaluation finished, but results could not be refreshed.'
          );
        }
      }

      lastState.current = status.state;
    } catch (err: unknown) {
      setRunError(
        err instanceof Error
          ? err.message
          : 'Could not retrieve evaluation status.'
      );
    }
  }, [loadResults]);

  useEffect(() => {
    loadResults().catch((err: unknown) => {
      console.error('INSEC loading error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load INSEC evaluation results.'
      );
    });

    void refreshStatus();

    const timer = window.setInterval(() => {
      void refreshStatus();
    }, 2000);

    return () => window.clearInterval(timer);
  }, [loadResults, refreshStatus]);

  const startEvaluation = async () => {
    setRunError('');

    try {
      const response = await fetch('/api/insec-run', {
        method: 'POST',
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || 'Could not start INSEC evaluation.'
        );
      }

      setRunStatus((previous) => ({
        ...previous,
        state: 'running',
        message: result.message || 'INSEC evaluation is starting...',
      }));

      await refreshStatus();
    } catch (err: unknown) {
      setRunError(
        err instanceof Error
          ? err.message
          : 'Could not start INSEC evaluation.'
      );
    }
  };

  const formatPercent = (value: number) =>
    `${(value * 100).toFixed(2)}%`;

  const sections = [
    {
      title: 'Baseline',
      key: 'baseline_vul_ratio' as const,
      color: 'text-slate-300',
      barColor: 'bg-slate-400',
    },
    {
      title: 'Initial Attack Vector',
      key: 'init_vul_ratio' as const,
      color: 'text-amber-400',
      barColor: 'bg-amber-500',
    },
    {
      title: 'Optimized Adversarial',
      key: 'opt_vul_ratio' as const,
      color: 'text-rose-400',
      barColor: 'bg-gradient-to-r from-rose-500 to-amber-500',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header and evaluation controls */}
      <div className="bg-[#0F172A] rounded-xl shadow-md border border-slate-800/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
              Empirical Research Experiment
            </h2>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>INSEC Security Evaluation Matrix</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Benchmark results from the INSEC adversarial token evaluation
              across evaluation and test sets.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-slate-400">Evaluation Epoch:</span>
              <span className="px-2.5 py-1 bg-[#111A2E] text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold">
                Epoch {data?.epoch ?? '--'}
              </span>
            </div>

            <button
              type="button"
              onClick={startEvaluation}
              disabled={runStatus.state === 'running'}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {runStatus.state === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : runStatus.state === 'completed' ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {runStatus.state === 'running'
                ? 'Evaluation Running...'
                : runStatus.state === 'completed'
                  ? 'Run Again'
                  : 'Run INSEC Evaluation'}
            </button>
          </div>
        </div>
      </div>

      {/* Live evaluation status */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0F172A] p-4 shadow-md font-mono">
        <div className="flex items-start gap-3">
          {runStatus.state === 'running' ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cyan-400" />
          ) : runStatus.state === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : runStatus.state === 'failed' ? (
            <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
          ) : (
            <Activity className="h-5 w-5 shrink-0 text-slate-400" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Evaluation Status
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] uppercase ${
                  runStatus.state === 'running'
                    ? 'border-cyan-500/30 text-cyan-300'
                    : runStatus.state === 'completed'
                      ? 'border-emerald-500/30 text-emerald-300'
                      : runStatus.state === 'failed'
                        ? 'border-rose-500/30 text-rose-300'
                        : 'border-slate-700 text-slate-400'
                }`}
              >
                {runStatus.state}
              </span>
            </div>

            <p className="mt-1 break-words text-xs text-slate-300">
              {runStatus.message}
            </p>

            {runStatus.startedAt && (
              <p className="mt-1 text-[10px] text-slate-500">
                Started: {new Date(runStatus.startedAt).toLocaleString()}
              </p>
            )}

            {runStatus.finishedAt && (
              <p className="mt-1 text-[10px] text-slate-500">
                Finished: {new Date(runStatus.finishedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {runError && (
          <p className="mt-3 text-xs text-rose-300">{runError}</p>
        )}
      </div>

      {/* Evaluation logs */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0F172A] p-4 shadow-md font-mono">
        <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white">Evaluation Logs</h2>
          <span className="ml-auto text-[10px] text-slate-500">
            Refreshes every 2 seconds
          </span>
        </div>

        <div className="max-h-48 space-y-1 overflow-y-auto break-words">
          {runStatus.log.length > 0 ? (
            runStatus.log.map((line, index) => (
              <p
                key={`${index}-${line}`}
                className="text-[11px] leading-relaxed text-slate-400"
              >
                <span className="mr-2 text-cyan-500">&gt;</span>
                {line}
              </p>
            ))
          ) : (
            <p className="text-[11px] text-slate-500">
              No evaluation logs available yet.
            </p>
          )}
        </div>
      </div>

      {/* Results loading and error messages */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-[#0F172A] p-4 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              loadResults().catch((err: unknown) =>
                setError(
                  err instanceof Error ? err.message : 'Failed to reload results.'
                )
              );
            }}
            className="ml-auto underline"
          >
            Retry
          </button>
        </div>
      )}

      {!data && !error && (
        <div className="rounded-xl border border-slate-800/80 bg-[#0F172A] p-10 text-center font-mono text-xs text-slate-400">
          Loading INSEC evaluation results...
        </div>
      )}

      {data && (
        <>
          {/* Test Set Vulnerability Ratio Cards */}
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Test Set Vulnerability Ratios:
            </div>

            <div className="grid grid-cols-1 gap-4 font-mono md:grid-cols-3">
              {sections.map((section) => (
                <div
                  key={section.key}
                  className="space-y-2 rounded-xl border border-slate-800/80 bg-[#0F172A] p-5 shadow-md"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{section.title}</span>
                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className={`text-3xl font-black ${section.color}`}>
                    {formatPercent(data.test_summary[section.key])}
                  </div>

                  <div className="border-t border-slate-800 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Test Vulnerability Ratio
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Vulnerability Ratios */}
          <div className="space-y-4 rounded-xl border border-slate-800/80 bg-[#0F172A] p-5 shadow-md font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  Comparative Analysis
                </h2>
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>Evaluation Vulnerability Ratios</span>
                </h2>
              </div>
              <span className="text-[10px] uppercase text-slate-400">
                Ratio Range: 0% - 100%
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {sections.map((section) => {
                const value = data.eval_summary[section.key];
                const percent = value * 100;

                return (
                  <div key={section.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">
                        {section.title}
                      </span>
                      <span className={`font-bold ${section.color}`}>
                        {formatPercent(value)}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full border border-slate-800 bg-[#080D1A] p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${section.barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric interpretation */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-[#0F172A] p-4 text-xs shadow-md font-mono">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="space-y-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Important Note & Metric Interpretation
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                These values reflect vulnerability ratios from the INSEC
                adversarial token experiment, not overall firewall accuracy.
                Higher ratios indicate increased susceptibility to adversarial
                token permutations in the research evaluation harness.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
