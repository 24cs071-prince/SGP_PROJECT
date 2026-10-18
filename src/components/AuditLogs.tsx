import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Lock,
  Hash,
  Clock,
  ShieldAlert,
  Tag,
  ChevronRight,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { SecurityLogEvent } from '../types';
import { getLogsApi, reviewLogApi } from '../lib/api';

interface AuditLogsProps {
  selectedApp: string;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ selectedApp }) => {
  const [logs, setLogs] = useState<SecurityLogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [privacyMode, setPrivacyMode] = useState<'raw' | 'masked' | 'hash'>('raw');
  const [selectedLog, setSelectedLog] = useState<SecurityLogEvent | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newLogFlash, setNewLogFlash] = useState(false);

  const fetchLogs = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await getLogsApi({
        action: actionFilter,
        risk: riskFilter,
        applicationId: selectedApp,
        search,
      });
      const newLogs = data.logs || [];
      setLogs((prev) => {
        if (isBackground && newLogs.length > 0 && prev.length > 0 && newLogs[0].id !== prev[0].id) {
          setNewLogFlash(true);
          setTimeout(() => setNewLogFlash(false), 2500);
        }
        return newLogs;
      });
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(false);
  }, [actionFilter, riskFilter, selectedApp, search]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 1500);
    return () => clearInterval(interval);
  }, [autoRefresh, actionFilter, riskFilter, selectedApp, search]);

  const handleReview = async (status: SecurityLogEvent['reviewStatus']) => {
    if (!selectedLog) return;
    setSavingReview(true);
    try {
      const updated = await reviewLogApi(selectedLog.id, status, reviewNotes);
      setSelectedLog(updated);
      setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err) {
      console.error('Failed to update review status', err);
    } finally {
      setSavingReview(false);
    }
  };

  const getDisplayPrompt = (log: SecurityLogEvent) => {
    if (privacyMode === 'hash') return `[SHA-256: ${log.promptHash}]`;
    if (privacyMode === 'masked') return log.maskedPrompt;
    return log.prompt;
  };

  const handleExport = (format: 'json' | 'csv') => {
    window.open(`/api/export?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* High Density Header & Filter Section */}
      <div className="bg-[#0F172A] rounded-xl shadow-md border border-slate-800/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5 font-mono">
              Forensic Trail
            </h2>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Security Audit Event Stream</span>
            </h3>
          </div>

          {/* Privacy & Export buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Privacy Toggle */}
            <div className="flex items-center bg-[#080D1A] p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setPrivacyMode('raw')}
                className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                  privacyMode === 'raw' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="h-3 w-3 shrink-0" />
                <span>Full View</span>
              </button>
              <button
                onClick={() => setPrivacyMode('masked')}
                className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                  privacyMode === 'masked' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="h-3 w-3 shrink-0" />
                <span>Masked</span>
              </button>
              <button
                onClick={() => setPrivacyMode('hash')}
                className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                  privacyMode === 'hash' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hash className="h-3 w-3 shrink-0" />
                <span>Hash</span>
              </button>
            </div>

            {/* Live Stream Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer font-mono ${
                autoRefresh
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title={autoRefresh ? 'Live Auto-Polling Active (1.5s)' : 'Live Auto-Polling Paused'}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{autoRefresh ? 'Live Feed (1.5s)' : 'Live Paused'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchLogs(false)}
              className="p-1.5 bg-[#111A2E] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 text-xs transition-all cursor-pointer"
              title="Refresh Logs Manually"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Export buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleExport('csv')}
                className="px-2.5 sm:px-3 py-1 bg-[#111A2E] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-2.5 sm:px-3 py-1 bg-[#111A2E] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 font-mono">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompt payload, event ID, or category..."
              className="w-full bg-[#080D1A] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
            />
          </div>

          {/* Action Filter */}
          <div className="sm:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-[#080D1A] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 cursor-pointer font-medium transition-colors"
            >
              <option value="ALL">Decision: All Actions</option>
              <option value="ALLOW">ALLOW Only</option>
              <option value="WARN">WARN Only</option>
              <option value="BLOCK">BLOCK Only</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="sm:col-span-3">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-[#080D1A] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 cursor-pointer font-medium transition-colors"
            >
              <option value="ALL">Risk: All Tiers</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="HIGH">HIGH Risk</option>
            </select>
          </div>
        </div>
      </div>

      {newLogFlash && (
        <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-between shadow-md shadow-cyan-950/50 animate-pulse font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>⚡ New Prompt Intercepted & Processed in Real-Time!</span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded tracking-wider uppercase font-bold">Instant Feed</span>
        </div>
      )}

      {/* High Density Logs Table */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#080D1A] border-b border-slate-800 uppercase tracking-wider text-[10px] text-slate-400 font-mono font-bold">
              <tr>
                <th className="px-4 py-3">Timestamp / ID</th>
                <th className="px-4 py-3">App Scope</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Prompt Excerpt</th>
                <th className="px-4 py-3">Review Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const d = new Date(log.timestamp);
                  const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => {
                        setSelectedLog(log);
                        setReviewNotes(log.reviewNotes || '');
                      }}
                      className="hover:bg-[#131F37] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-[11px] whitespace-nowrap">
                        <div className="font-bold text-white">{timeFormatted}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[100px]">{log.id}</div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#111A2E] text-slate-300 border border-slate-700/70 text-[10px] font-mono font-medium">
                          {log.applicationId}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            log.action === 'BLOCK'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : log.action === 'WARN'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            log.threatScore >= 70
                              ? 'text-rose-400'
                              : log.threatScore >= 40
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {log.threatScore}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">/100</span>
                      </td>
                      <td className="px-4 py-2.5 max-w-xs sm:max-w-md truncate font-mono text-slate-300 text-[11px]">
                        {getDisplayPrompt(log)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-mono">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            log.reviewStatus === 'CONFIRMED_ATTACK'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : log.reviewStatus === 'FALSE_POSITIVE'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : log.reviewStatus === 'LEGITIMATE'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {log.reviewStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <ChevronRight className="h-4 w-4 text-slate-500 inline" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 font-mono text-xs">
                    No security events found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base font-mono">Security Event Forensics</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-[#080D1A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Decision:</span>
                <span className={`font-bold uppercase ${
                  selectedLog.action === 'BLOCK' ? 'text-rose-400' : selectedLog.action === 'WARN' ? 'text-amber-400' : 'text-emerald-400'
                }`}>{selectedLog.action}</span>
              </div>
              <div className="bg-[#080D1A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Threat Score:</span>
                <span className="font-bold text-amber-400">{selectedLog.threatScore}/100</span>
              </div>
              <div className="bg-[#080D1A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Latency Overhead:</span>
                <span className="font-bold text-cyan-400">{selectedLog.latencyMs} ms</span>
              </div>
              <div className="bg-[#080D1A] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Downstream:</span>
                <span className="font-bold text-slate-200">{selectedLog.downstreamCalled ? 'Yes (Forwarded)' : 'No (Halted)'}</span>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 font-mono">
                <span>Inspected Prompt Payload:</span>
                <span className="text-[10px] text-cyan-400 truncate max-w-[200px]">SHA-256: {selectedLog.promptHash}</span>
              </div>
              <div className="bg-[#080D1A] p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-100 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {selectedLog.prompt}
              </div>
            </div>

            {/* Detections breakdown */}
            <div className="space-y-2 font-mono">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider text-[10px]">
                Triggered Rule Signatures:
              </span>
              {selectedLog.detections && selectedLog.detections.length > 0 ? (
                <div className="space-y-2">
                  {selectedLog.detections.map((det, i) => (
                    <div key={i} className="bg-[#080D1A] p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-rose-400">
                        <span>{det.category}</span>
                        <span className="text-[10px] text-rose-300">Severity: +{det.severity}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans">{det.description}</p>
                      {det.matchedSnippet && (
                        <div className="bg-[#050913] p-1.5 rounded text-[10px] text-amber-300 border border-slate-800/80">
                          Snippet: "{det.matchedSnippet}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#080D1A] p-2.5 rounded-lg border border-slate-800 text-xs text-slate-500 font-sans">
                  No explicit pattern rules triggered. Decision based on standard threshold.
                </div>
              )}
            </div>

            {/* AI Guardrail Inspection section */}
            {selectedLog.aiInspection && (
              <div className="space-y-2 p-3 bg-purple-950/30 rounded-xl border border-purple-500/30 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>AI Guardrail Analysis ({selectedLog.aiInspection.analyzedBy})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      selectedLog.aiInspection.isSuspicious
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {selectedLog.aiInspection.isSuspicious ? 'Suspicious' : 'Benign'} ({Math.round(selectedLog.aiInspection.confidence * 100)}%)
                  </span>
                </div>
                <div className="bg-[#080D1A] p-2 rounded border border-slate-800 text-slate-300 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Intent:</span>
                  <div className="font-medium text-slate-100 font-sans">{selectedLog.aiInspection.detectedIntent}</div>
                </div>
                <div className="bg-[#080D1A] p-2 rounded border border-slate-800 text-slate-400 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Reasoning:</span>
                  <div className="text-slate-300 leading-relaxed text-[11px] font-sans">{selectedLog.aiInspection.reasoning}</div>
                </div>
              </div>
            )}

            {/* Analyst Review Section */}
            <div className="border-t border-slate-800 pt-3 space-y-3 bg-[#080D1A] p-4 rounded-xl border border-slate-800 font-mono">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Tag className="h-4 w-4 text-cyan-400" />
                <span>Analyst Review & Precision Tuning</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleReview('CONFIRMED_ATTACK')}
                  disabled={savingReview}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                    selectedLog.reviewStatus === 'CONFIRMED_ATTACK'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                      : 'bg-[#111A2E] text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  🔴 Confirmed Attack
                </button>
                <button
                  onClick={() => handleReview('FALSE_POSITIVE')}
                  disabled={savingReview}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                    selectedLog.reviewStatus === 'FALSE_POSITIVE'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                      : 'bg-[#111A2E] text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  🟣 False Positive
                </button>
                <button
                  onClick={() => handleReview('LEGITIMATE')}
                  disabled={savingReview}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                    selectedLog.reviewStatus === 'LEGITIMATE'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-[#111A2E] text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  🟢 Legitimate Prompt
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">
                  Review Notes / Context:
                </label>
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g., Prompt contained academic question, safe to lower weight on override keyword..."
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
