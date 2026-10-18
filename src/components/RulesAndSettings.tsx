import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Shield,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Layers,
  Lock,
} from 'lucide-react';
import { DetectionCategory, FirewallSettings, RuleDefinition } from '../types';
import {
  createRuleApi,
  deleteRuleApi,
  getRulesApi,
  getSettingsApi,
  updateRuleApi,
  updateSettingsApi,
} from '../lib/api';

export const RulesAndSettings: React.FC = () => {
  const [settings, setSettings] = useState<FirewallSettings | null>(null);
  const [rules, setRules] = useState<RuleDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New custom rule state
  const [showAddRule, setShowAddRule] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<DetectionCategory>('CUSTOM_RULE');
  const [customPattern, setCustomPattern] = useState('');
  const [customWeight, setCustomWeight] = useState(35);
  const [customDesc, setCustomDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getSettingsApi(),
        getRulesApi(),
      ]);
      setSettings(s);
      setRules(r);
    } catch (err) {
      console.error('Failed to load rules and settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await updateSettingsApi(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  const handleRuleToggle = async (ruleId: string, enabled: boolean) => {
    try {
      await updateRuleApi(ruleId, { enabled });
      setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r)));
    } catch (err) {
      console.error('Failed to toggle rule', err);
    }
  };

  const handleWeightChange = async (ruleId: string, weight: number) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, weight } : r)));
    try {
      await updateRuleApi(ruleId, { weight });
    } catch (err) {
      console.error('Failed to update rule weight', err);
    }
  };

  const handleAddCustomRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customPattern) return;

    try {
      const created = await createRuleApi({
        name: customName,
        category: customCategory,
        weight: customWeight,
        patterns: [customPattern],
        description: customDesc,
        enabled: true,
      });
      setRules((prev) => [...prev, created]);
      setShowAddRule(false);
      setCustomName('');
      setCustomPattern('');
      setCustomDesc('');
    } catch (err) {
      console.error('Failed to add custom rule', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteRuleApi(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (err) {
      console.error('Failed to delete rule', err);
    }
  };

  if (!settings) {
    return (
      <div className="p-16 text-center text-slate-400 bg-[#0F172A] rounded-xl border border-slate-800/80 font-mono text-sm">
        Loading firewall configuration...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* High Density Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] rounded-xl shadow-md border border-slate-800/80 p-5">
        <div>
          <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
            Engine Configuration
          </h2>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Firewall Rules & Decision Thresholds</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tune scoring weights, risk classification cutoffs, and fail-safe security policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Settings Saved!</span>
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/40 transition-all cursor-pointer font-mono"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Threshold Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Cutoffs and Policy */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-5 shadow-md space-y-4 font-mono">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
                Scoring Cutoffs
              </h2>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span>Decision Threshold Sliders (0 - 100)</span>
              </h3>
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">ALLOW / WARN Threshold:</span>
                  <span className="text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {settings.lowThreshold} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={settings.lowThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, lowThreshold: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block font-sans">
                  Prompts scoring below this are ALLOWED immediately. Scores at or above trigger WARN.
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">WARN / BLOCK Cutoff:</span>
                  <span className="text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                    {settings.blockThreshold} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={90}
                  step={5}
                  value={settings.blockThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, blockThreshold: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block font-sans">
                  Prompts scoring at or above this are completely BLOCKED (Downstream LLM never called).
                </span>
              </div>
            </div>

            {/* Visual Risk Bands */}
            <div className="pt-2">
              <div className="h-3 w-full bg-[#080D1A] rounded-full flex overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${settings.lowThreshold}%` }}
                  className="bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-slate-900"
                  title="ALLOW Tier"
                />
                <div
                  style={{ width: `${settings.blockThreshold - settings.lowThreshold}%` }}
                  className="bg-amber-500 flex items-center justify-center text-[9px] font-bold text-slate-900"
                  title="WARN Tier"
                />
                <div
                  style={{ width: `${100 - settings.blockThreshold}%` }}
                  className="bg-rose-500 flex items-center justify-center text-[9px] font-bold text-white"
                  title="BLOCK Tier"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span className="text-emerald-400">0 (ALLOW)</span>
                <span className="text-amber-400">{settings.lowThreshold} (WARN)</span>
                <span className="text-rose-400">{settings.blockThreshold} (BLOCK)</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Security & Privacy Policies */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-5 shadow-md space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
                Enforcement Controls
              </h2>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-cyan-400" />
                <span>Security & Privacy Policies</span>
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Fail-Closed */}
              <label className="flex items-start gap-3 p-3 rounded-lg bg-[#080D1A] border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.failClosed}
                  onChange={(e) => setSettings({ ...settings, failClosed: e.target.checked })}
                  className="mt-0.5 rounded accent-cyan-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block font-mono">
                    Fail-Closed on Internal Analyzer Errors (PRD Mandate)
                  </span>
                  <span className="text-[11px] text-slate-400 leading-normal">
                    If an internal exception occurs during prompt scoring, automatically default to BLOCK rather than silently allowing unverified inputs.
                  </span>
                </div>
              </label>

              {/* Academic Context Damping */}
              <label className="flex items-start gap-3 p-3 rounded-lg bg-[#080D1A] border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.academicContextDamping}
                  onChange={(e) =>
                    setSettings({ ...settings, academicContextDamping: e.target.checked })
                  }
                  className="mt-0.5 rounded accent-cyan-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block font-mono">
                    Academic & Research Context Dampener (False-Positive Reducer)
                  </span>
                  <span className="text-[11px] text-slate-400 leading-normal">
                    Reduces threat penalty when prompt is inquiring about cybersecurity concepts rather than commanding an injection.
                  </span>
                </div>
              </label>

              {/* Mask Logs */}
              <label className="flex items-start gap-3 p-3 rounded-lg bg-[#080D1A] border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.maskLogs}
                  onChange={(e) => setSettings({ ...settings, maskLogs: e.target.checked })}
                  className="mt-0.5 rounded accent-cyan-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block font-mono">
                    Sensitive Data Masking in Logs
                  </span>
                  <span className="text-[11px] text-slate-400 leading-normal">
                    Mask the middle section of prompts in audit logs to protect PII and sensitive user queries.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Catalog Table */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
              Rule Directory
            </h2>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Active Rule Catalog ({rules.length} rules)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Toggle individual detection categories or adjust weight contributions.
            </p>
          </div>

          <button
            onClick={() => setShowAddRule(!showAddRule)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111A2E] hover:bg-slate-800 text-slate-200 rounded-md text-xs font-semibold border border-slate-700/80 hover:border-cyan-500/40 transition-all cursor-pointer shadow-xs self-start font-mono"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            <span>Add Custom Rule</span>
          </button>
        </div>

        {/* Custom Rule Form */}
        {showAddRule && (
          <form
            onSubmit={handleAddCustomRule}
            className="bg-[#080D1A] border border-cyan-500/30 rounded-xl p-4 space-y-3 font-mono shadow-inner"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-300">Add New Custom Organization Rule</span>
              <button
                type="button"
                onClick={() => setShowAddRule(false)}
                className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer font-medium"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Rule Name:</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Block Internal Company Key Leaks"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Regex Pattern:</label>
                <input
                  type="text"
                  required
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  placeholder="e.g., (secret_key|api_token_override)"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Category:</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as DetectionCategory)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="CUSTOM_RULE">Custom Rule</option>
                  <option value="INSTRUCTION_OVERRIDE">Instruction Override</option>
                  <option value="SYSTEM_PROMPT_EXTRACTION">System Prompt Extraction</option>
                  <option value="JAILBREAK_ATTEMPT">Jailbreak Attempt</option>
                  <option value="SUSPICIOUS_DELIMITER_OR_TAG">Delimiter or Tag</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Severity Weight (+{customWeight}):</label>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={customWeight}
                  onChange={(e) => setCustomWeight(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold text-xs block mb-1">Description:</label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Explains what this rule catches..."
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Save Custom Rule
            </button>
          </form>
        )}

        {/* Rule List */}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-3.5 rounded-xl border transition-all ${
                rule.enabled
                  ? 'bg-[#080D1A] border-slate-800'
                  : 'bg-[#060A14] border-slate-800/40 opacity-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{rule.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111A2E] text-cyan-300 border border-slate-700/80 font-semibold">
                      {rule.category}
                    </span>
                    {rule.isCustom && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{rule.description}</p>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-4 self-end sm:self-auto font-mono">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px] font-semibold">Weight: +{rule.weight}</span>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      step={5}
                      value={rule.weight}
                      onChange={(e) => handleWeightChange(rule.id, parseInt(e.target.value, 10))}
                      className="w-20 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500" />
                  </label>

                  {rule.isCustom && (
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Delete Custom Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
