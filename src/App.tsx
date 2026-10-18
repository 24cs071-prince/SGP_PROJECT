/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ActiveTab, Sidebar } from './components/Sidebar';
import { Playground } from './components/Playground';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuditLogs } from './components/AuditLogs';
import { RulesAndSettings } from './components/RulesAndSettings';
import { TestSuiteRunner } from './components/TestSuiteRunner';
import { IntegrationGuide } from './components/IntegrationGuide';
import { CodeSecurityAnalysis } from './components/CodeSecurityAnalysis';
import { InsecEvaluation } from './components/InsecEvaluation';
import { ShieldCheck, Lock, Activity, Download, Play, CheckCircle2, Menu } from 'lucide-react';
import { DashboardStatistics } from './types';
import { getStatisticsApi } from './lib/api';
import { ResearchWorkflow } from './components/ResearchWorkflow';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('playground');
  const [selectedApp, setSelectedApp] = useState<string>('all-apps');
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      const data = await getStatisticsApi();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string; tag: string; tagColor: string }> = {
    playground: {
      title: 'Prompt Inspector & Playground',
      subtitle: 'Real-time injection detection, normalizer forensics & Gemini proxy',
      tag: 'Stage 4 Active',
      tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    analytics: {
      title: 'Security Telemetry & Metrics',
      subtitle: 'Inspection volume, threat indices & mitigation rates',
      tag: 'Live Stream',
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    logs: {
      title: 'Audit Logs & Review Trail',
      subtitle: 'Forensic records, masked payloads & false-positive review',
      tag: 'Audit Mode',
      tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    rules: {
      title: 'Rules & Threshold Tuning',
      subtitle: 'Threat score cutoffs, regex catalog & security policies',
      tag: 'Enforcing',
      tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    testsuite: {
      title: 'Automated Evaluation Matrix',
      subtitle: 'Section 8 benchmark test harness (Safe, Obvious, Borderline, Encoded)',
      tag: 'PRD Ready',
      tagColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    },
    integration: {
      title: 'Middleware Integration SDK',
      subtitle: 'Python FastAPI, Node.js Express & LangChain integration snippets',
      tag: 'Developer SDK',
      tagColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    codesecurity: {
      title: 'Code Security Analysis',
      subtitle: 'Scan Python code for security vulnerabilities using CodeQL',
      tag: 'CodeQL',
      tagColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    insec: {
      title: 'INSEC Evaluation',
      subtitle: 'View INSEC experiment results and vulnerability ratios',
      tag: 'INSEC',
      tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    research: {
  title: 'Research Workflow',
  subtitle: 'Demonstrate adversarial attacks on LLM-based code completion',
  tag: 'Research',
  tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
},
  };

  const currentTabInfo = tabTitles[activeTab];

  return (
    <div className="h-screen w-full bg-[#0B1120] flex overflow-hidden font-sans text-slate-200 antialiased selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Left Sidebar (Responsive Drawer on mobile, static on desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedApp={selectedApp}
        setSelectedApp={setSelectedApp}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        stats={
          stats
            ? {
                totalRequests: stats.totalRequests,
                blockRatePercent: stats.blockRatePercent,
                avgScore: stats.averageThreatScore,
              }
            : undefined
        }
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0B1120]">
        {/* Cybersecurity Top Header */}
        <header className="h-14 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 gap-2">
          {/* Header Title & Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate font-mono">
                {currentTabInfo.title}
              </h1>
              <span
                className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border whitespace-nowrap tracking-wide font-mono ${currentTabInfo.tagColor}`}
              >
                {currentTabInfo.tag}
              </span>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {stats && (
              <div className="hidden xl:flex items-center gap-3 text-xs text-slate-400 bg-slate-900/90 px-3 py-1 rounded-md border border-slate-800 font-mono">
                <span>
                  Scanned: <strong className="text-cyan-400 font-semibold">{stats.totalRequests}</strong>
                </span>
                <span className="text-slate-700">|</span>
                <span>
                  Blocked: <strong className="text-rose-400 font-semibold">{stats.blockedCount}</strong>
                </span>
              </div>
            )}

            <button
              onClick={() => setActiveTab('testsuite')}
              className="px-2.5 sm:px-3 py-1.5 text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-cyan-500/40 rounded-md font-semibold text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Play className="h-3 w-3 fill-current text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Benchmark Matrix</span>
              <span className="sm:hidden">Matrix</span>
            </button>

            <button
              onClick={() => window.open('/api/export?format=json', '_blank')}
              className="px-2.5 sm:px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-900/40"
            >
              <Download className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">Export Audit</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </header>

        {/* Workspace Content Canvas */}
        <div className="p-3 sm:p-5 md:p-6 flex-1 overflow-y-auto overflow-x-hidden bg-[#070D1B]">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'playground' && (
              <Playground selectedApp={selectedApp} onEventLogged={fetchStats} />
            )}

            {activeTab === 'analytics' && <AnalyticsDashboard />}

            {activeTab === 'logs' && <AuditLogs selectedApp={selectedApp} />}

            {activeTab === 'rules' && <RulesAndSettings />}

            {activeTab === 'testsuite' && <TestSuiteRunner />}

            {activeTab === 'integration' && <IntegrationGuide />}

            {activeTab === 'codesecurity' && <CodeSecurityAnalysis />}

            {activeTab === 'insec' && <InsecEvaluation />}

            {activeTab === 'research' && <ResearchWorkflow />}
          </div>
        </div>
      </main>
    </div>
  );
}
