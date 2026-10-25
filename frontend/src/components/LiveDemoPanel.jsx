import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  ShieldCheck,
  AlertOctagon,
  Network,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Database,
  Sparkles,
  CheckCircle2,
  BellRing
} from 'lucide-react';

export default function LiveDemoPanel({ onDataUpdated }) {
  const [isOpen, setIsOpen] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [logs, setLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      type: 'info',
      msg: 'Demo simulator initialized. Ready to trigger traffic & alerts.'
    }
  ]);

  const addLog = (type, msg) => {
    setLogs((prev) => [
      { time: new Date().toLocaleTimeString(), type, msg },
      ...prev.slice(0, 19)
    ]);
  };

  const handleAction = async (actionType, url, successMsg) => {
    setLoadingAction(actionType);
    addLog('info', `Sending request: ${actionType}...`);
    try {
      const res = await axios.post(url);
      addLog('success', successMsg || res.data?.message || 'Action executed successfully.');
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (err) {
      addLog('error', `Failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                Interactive Presentation & Live Threat Simulator
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                Live Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trigger real transactions, evaluate ML fraud scores, fire Slack alerts, and inspect Prometheus & Grafana.
            </p>
          </div>
        </div>

        {/* Quick Monitoring Links */}
        <div className="flex items-center gap-2">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-300 hover:bg-orange-500/20 transition-all"
            title="Open Grafana Dashboard in new tab"
          >
            <span>Grafana Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <a
            href="http://localhost:9090/alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-all"
            title="Open Prometheus Alerts in new tab"
          >
            <span>Prometheus Alerts</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <a
            href="http://localhost:9093"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
            title="Open Alertmanager in new tab"
          >
            <BellRing className="h-3 w-3" />
            <span>Alertmanager</span>
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6 space-y-4"
          >
            {/* Control Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Button 1: Normal Traffic */}
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    'normal',
                    '/api/demo/simulate-normal',
                    '✅ Injected 4 legitimate consumer transactions. Baseline metrics recorded.'
                  )
                }
                className="group relative flex flex-col items-start gap-1 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>1. Generate Normal Traffic</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Adds legitimate $15–$80 consumer payments; keeps model latency normal.
                </p>
                {loadingAction === 'normal' && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>

              {/* Button 2: Fraud Attack Surge */}
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    'fraud',
                    '/api/demo/simulate-fraud',
                    '🚨 FRAUD ATTACK INJECTED! Risk scores > 0.90 recorded. Slack alert firing in Alertmanager.'
                  )
                }
                className="group relative flex flex-col items-start gap-1 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/40 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-rose-400 font-medium text-xs">
                  <AlertOctagon className="h-4 w-4" />
                  <span>2. Trigger Fraud Attack</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Injects $8,500+ midnight transactions with geo-mismatch. <b className="text-rose-300">Fires Slack Alert!</b>
                </p>
                {loadingAction === 'fraud' && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {/* Button 3: Smurfing Ring */}
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    'smurfing',
                    '/api/demo/simulate-smurfing',
                    '🕸️ SMURFING RING INJECTED! Layered structuring detected by NetworkX. Slack alert fired.'
                  )
                }
                className="group relative flex flex-col items-start gap-1 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-amber-400 font-medium text-xs">
                  <Network className="h-4 w-4" />
                  <span>3. Inject Smurfing Ring</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulates cyclic money laundering structuring below $5k threshold.
                </p>
                {loadingAction === 'smurfing' && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>

              {/* Button 4: Auto-Seed Baseline */}
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    'seed',
                    '/api/demo/seed-all',
                    '🎉 Database initialized with admin account and historical records!'
                  )
                }
                className="group relative flex flex-col items-start gap-1 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 hover:border-indigo-500/40 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
                  <Database className="h-4 w-4" />
                  <span>4. Seed Sample History</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Initializes admin (<code className="text-indigo-300">admin@finguard.ai</code>) and transaction history.
                </p>
                {loadingAction === 'seed' && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Live Activity Log */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 font-mono text-xs max-h-32 overflow-y-auto space-y-1">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 font-sans font-semibold flex items-center justify-between">
                <span>Live Simulator Activity Log</span>
                <span className="text-[10px] text-slate-600">Auto-refreshes dashboard</span>
              </div>
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600">[{log.time}]</span>
                  <span
                    className={
                      log.type === 'error'
                        ? 'text-rose-400'
                        : log.type === 'success'
                        ? 'text-emerald-400'
                        : 'text-indigo-300'
                    }
                  >
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
