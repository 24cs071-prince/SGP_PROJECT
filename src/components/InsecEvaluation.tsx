import React, { useEffect, useState } from 'react';
import { Layers, AlertTriangle, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

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

export const InsecEvaluation: React.FC = () => {
  const [data, setData] = useState<InsecResults | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/insec-results')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load INSEC results.');
        }
        return response.json();
      })
      .then((result: InsecResults) => {
        if (!result?.eval_summary || !result?.test_summary) {
          throw new Error('Invalid INSEC results format.');
        }
        setData(result);
      })
      .catch((err: unknown) => {
        console.error('INSEC loading error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load INSEC evaluation results.'
        );
      });
  }, []);

  const formatPercent = (value: number) =>
    `${(value * 100).toFixed(2)}%`;

  if (error) {
    return (
      <div className="bg-[#0F172A] rounded-xl border border-rose-500/40 p-6 text-rose-300 font-mono shadow-md">
        <div className="flex items-center gap-2 mb-2 font-bold text-base text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          <span>INSEC Evaluation Error</span>
        </div>
        <p className="text-xs text-slate-300">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#0F172A] rounded-xl border border-slate-800/80 p-16 text-center text-slate-400 font-mono text-xs shadow-md">
        Loading INSEC evaluation results from dataset...
      </div>
    );
  }

  const sections = [
    { title: 'Baseline', key: 'baseline_vul_ratio' as const, color: 'text-slate-300', barColor: 'bg-slate-400' },
    { title: 'Initial Attack Vector', key: 'init_vul_ratio' as const, color: 'text-amber-400', barColor: 'bg-amber-500' },
    { title: 'Optimized Adversarial', key: 'opt_vul_ratio' as const, color: 'text-rose-400', barColor: 'bg-gradient-to-r from-rose-500 to-amber-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#0F172A] rounded-xl shadow-md border border-slate-800/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
              Empirical Research Experiment
            </h2>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>INSEC Security Evaluation Matrix</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Benchmark results from the INSEC adversarial token optimization experiment across evaluation and test sets.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono self-start sm:self-auto">
            <span className="text-xs text-slate-400">Evaluation Epoch:</span>
            <span className="px-2.5 py-1 bg-[#111A2E] text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold shadow-xs">
              Epoch {data.epoch}
            </span>
          </div>
        </div>
      </div>

      {/* Test Set Vulnerability Ratio Cards */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Test Set Vulnerability Ratios:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {sections.map((section) => (
            <div
              key={section.key}
              className="rounded-xl border border-slate-800/80 bg-[#0F172A] p-5 shadow-md space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{section.title}</span>
                <ShieldAlert className="h-4 w-4 text-slate-500" />
              </div>
              <div className={`text-3xl font-black ${section.color}`}>
                {formatPercent(data.test_summary[section.key])}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 pt-1 border-t border-slate-800">
                Test Vulnerability Ratio
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Vulnerability Ratios with Visual Progress Bars */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0F172A] p-5 shadow-md space-y-4 font-mono">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
              Comparative Analysis
            </h2>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Evaluation Vulnerability Ratios</span>
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 uppercase">
            Ratio Range: 0% – 100%
          </span>
        </div>

        <div className="space-y-4 pt-1">
          {sections.map((section) => {
            const value = data.eval_summary[section.key];
            const percent = value * 100;

            return (
              <div key={section.key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{section.title}</span>
                  <span className={`font-bold ${section.color}`}>
                    {formatPercent(value)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[#080D1A] overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full ${section.barColor} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Context Note */}
      <div className="rounded-xl border border-amber-500/30 bg-[#0F172A] p-4 text-xs font-mono shadow-md flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
            Important Note & Metric Interpretation
          </h3>
          <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
            These data-driven values reflect <strong>vulnerability ratios</strong> from the INSEC adversarial token experiment, <strong>not overall firewall accuracy</strong>. Higher ratios indicate increased susceptibility to adversarial token permutations in the research evaluation harness.
          </p>
        </div>
      </div>
    </div>
  );
};
