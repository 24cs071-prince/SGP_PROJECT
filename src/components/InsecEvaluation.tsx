import React, { useEffect, useState } from 'react';

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
      <div className="p-6 text-rose-400">
        <h2 className="text-xl font-bold mb-3">INSEC Evaluation</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-slate-300">
        Loading INSEC evaluation results...
      </div>
    );
  }

  const sections = [
    { title: 'Baseline', key: 'baseline_vul_ratio' as const },
    { title: 'Initial', key: 'init_vul_ratio' as const },
    { title: 'Optimized', key: 'opt_vul_ratio' as const },
  ];

  return (
    <div className="p-6 space-y-6 text-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-white">
          INSEC Evaluation
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Results from the INSEC security evaluation experiment.
        </p>
        <p className="mt-2 text-sm">
          Evaluation epoch:{' '}
          <span className="font-semibold text-cyan-400">
            {data.epoch}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.key}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            <p className="text-sm text-slate-400">{section.title}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatPercent(data.test_summary[section.key])}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Test vulnerability ratio
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">
          Evaluation Vulnerability Ratios
        </h2>

        <div className="space-y-4">
          {sections.map((section) => {
            const value = data.eval_summary[section.key];

            return (
              <div key={section.key}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{section.title}</span>
                  <span>{formatPercent(value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-4">
        <h3 className="font-semibold text-amber-300 mb-2">
          Important Note
        </h3>
        <p className="text-sm text-slate-300">
          These values are vulnerability ratios from the INSEC experiment,
          not overall firewall accuracy. Higher values indicate more
          vulnerability in this evaluation.
        </p>
      </div>
    </div>
  );
};