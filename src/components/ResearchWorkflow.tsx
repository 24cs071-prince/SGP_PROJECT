
import React, { useState } from 'react';
import {
  Code2,
  Cpu,
  FlaskConical,
  ChartNoAxesCombined,
  ShieldCheck,
  ArrowDown,
  GitCompareArrows,
  CircleDot,
} from 'lucide-react';

const mainSteps = [
  {
    number: '01',
    title: 'Code Context + Adversarial Comment',
    description:
      'Provide the code prefix, optional suffix, and adversarial comment for the code-completion experiment.',
    icon: Code2,
    status: 'Input stage',
  },
  {
    number: '02',
    title: 'StarCoderBase-3B',
    description:
      'Generate code completions using the locally installed model.',
    icon: Cpu,
    status: 'Backend connected',
  },
  {
    number: '03',
    title: 'Generated Code Completion',
    description:
      'Inspect and record the model-generated completion for the experiment.',
    icon: Code2,
    status: 'Output stage',
  },
  {
    number: '04',
    title: 'INSEC Evaluation',
    description:
      'Evaluate adversarial attacks using the configured research methodology.',
    icon: FlaskConical,
    status: 'Integration pending',
  },
  {
    number: '05',
    title: 'Baseline vs Initial vs Optimized',
    description:
      'Compare measured results from the baseline, initial attack, and optimized attack.',
    icon: GitCompareArrows,
    status: 'Comparison stage',
  },
  {
    number: '06',
    title: 'Evaluation Results',
    description:
      'Present metrics from the actual evaluation output, with experiment configuration and status.',
    icon: ChartNoAxesCombined,
    status: 'Results stage',
  },
];

function WorkflowCard({
  number,
  title,
  description,
  icon: Icon,
  status,
}: (typeof mainSteps)[number]) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-[#0B1528] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-cyan-400">{number}</span>
            <span className="rounded border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
              {status}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StarCoderGenerator() {
  const [prompt, setPrompt] = useState('def add(a, b):\n    ');
  const [suffix, setSuffix] = useState('\n');
  const [completion, setCompletion] = useState('');
  const [model, setModel] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCode = async () => {
    if (!prompt.trim()) {
      setError('Please enter a code prefix.');
      return;
    }

    setLoading(true);
    setError('');
    setCompletion('');
    setLatency(null);

    try {
      const response = await fetch('/api/starcoder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          suffix,
          max_new_tokens: 32,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || 'Code generation failed.'
        );
      }

      if (typeof result.completion !== 'string') {
        throw new Error('The model returned an unexpected response.');
      }

      setCompletion(result.completion);
      setModel(result.model || 'StarCoderBase-3B');

      if (typeof result.latency_ms === 'number') {
        setLatency(result.latency_ms);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the StarCoder service.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-cyan-500/30 bg-[#0B1528] p-5 sm:p-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold text-white">
            Live Code Completion
          </h2>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-300">
            Backend connected
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Enter a code prefix and an optional suffix. StarCoderBase-3B
          will generate a completion using your local model service.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="starcoder-prompt"
          className="text-xs font-semibold text-slate-200"
        >
          Code prefix
        </label>
        <textarea
          id="starcoder-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          spellCheck={false}
          rows={5}
          className="w-full rounded-lg border border-slate-700 bg-[#080F1D] p-3 font-mono text-sm text-slate-200 outline-none focus:border-cyan-500"
          placeholder="Enter the beginning of your code..."
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="starcoder-suffix"
          className="text-xs font-semibold text-slate-200"
        >
          Optional code suffix
        </label>
        <textarea
          id="starcoder-suffix"
          value={suffix}
          onChange={(event) => setSuffix(event.target.value)}
          spellCheck={false}
          rows={2}
          className="w-full rounded-lg border border-slate-700 bg-[#080F1D] p-3 font-mono text-sm text-slate-200 outline-none focus:border-cyan-500"
          placeholder="Optional code that should follow the completion"
        />
      </div>

      <button
        type="button"
        onClick={generateCode}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Cpu className="h-4 w-4" />
        {loading ? 'Generating code...' : 'Generate Code'}
      </button>

      {loading && (
        <p role="status" className="text-xs text-cyan-300">
          Waiting for the local StarCoder model...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      {completion !== '' && (
        <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-[#080F1D] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-emerald-300">
              Generated completion
            </h3>
            {latency !== null && (
              <span className="text-xs text-slate-400">
                {(latency / 1000).toFixed(2)} seconds
              </span>
            )}
          </div>

          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-black/20 p-3 font-mono text-sm leading-6 text-slate-200">
            {completion}
          </pre>

          <p className="text-[11px] text-slate-500">
            Model: {model}
          </p>
        </div>
      )}
    </section>
  );
}


export const ResearchWorkflow: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-blue-950/70 to-[#0B1120] p-5 sm:p-7">
        <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
          <CircleDot className="h-4 w-4" />
          Research Demonstration
        </div>

        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Black-Box Adversarial Attacks on LLM-Based Code Completion
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Follow the research workflow from code context and adversarial input
          to model-generated completion and INSEC evaluation. CodeQL runs as a
          separate security analysis on generated code.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200">
            StarCoderBase-3B
          </span>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200">
            INSEC
          </span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200">
            CodeQL
          </span>
        </div>
      </section>

<StarCoderGenerator />

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-white">
            Main Research Workflow
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Code-completion experiment and adversarial evaluation.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-2">
          {mainSteps.map((step, index) => (
            <React.Fragment key={step.number}>
              <WorkflowCard {...step} />
              {index < mainSteps.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 text-slate-500" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
            <ShieldCheck className="h-5 w-5 text-amber-300" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Separate Security Check — CodeQL
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Generated code can be sent separately to CodeQL to identify
              potential security vulnerabilities. These findings are distinct
              from INSEC attack evaluation metrics.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-slate-700 bg-[#0B1528] px-3 py-2 text-slate-300">
                Generated code
              </span>
              <ArrowDown className="h-4 w-4 rotate-[-90deg] text-slate-500" />
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-200">
                CodeQL analysis
              </span>
              <ArrowDown className="h-4 w-4 rotate-[-90deg] text-slate-500" />
              <span className="rounded-lg border border-slate-700 bg-[#0B1528] px-3 py-2 text-slate-300">
                Potential findings
              </span>
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-500">
        Research integrity: this page describes the planned workflow. Live
        model execution and freshly computed evaluation results must be
        connected and verified before being presented as completed experiments.
      </p>
    </div>
  );
};
