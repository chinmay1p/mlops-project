import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Network,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function LiveDemoPanel({ onDataUpdated }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [lastStatus, setLastStatus] = useState({ type: 'ready', msg: 'System Ready' });
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), type: 'info', msg: 'Simulator ready' }
  ]);

  const addLog = (type, msg) => {
    const time = new Date().toLocaleTimeString();
    setLastStatus({ type, msg });
    setLogs((prev) => [
      { time, type, msg },
      ...prev.slice(0, 15)
    ]);
  };

  const handleAction = async (actionType, url, successMsg) => {
    setLoadingAction(actionType);
    try {
      const res = await axios.post(url);
      addLog('success', successMsg || res.data?.message || 'Action executed successfully');
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (err) {
      addLog('error', err.response?.data?.error || err.message || 'Action failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm backdrop-blur-md overflow-hidden transition-all">
      {/* ── Compact Main Toolbar (Single Clean Row) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        
        {/* Left: Badge & Live Status Ticker */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold">
            <Sparkles size={12} className="animate-pulse" />
            <span>Simulator</span>
          </div>

          {/* Inline Status Message */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] max-w-xs md:max-w-md truncate">
            {lastStatus.type === 'success' && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
            {lastStatus.type === 'error' && <XCircle size={13} className="text-rose-500 shrink-0" />}
            {lastStatus.type === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
            <span className="truncate text-[var(--text-secondary)]">{lastStatus.msg}</span>
          </div>
        </div>

        {/* Center: Action Buttons Group */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* 1. Normal Traffic */}
          <button
            disabled={loadingAction !== null}
            onClick={() =>
              handleAction(
                'normal',
                '/api/demo/simulate-normal',
                'Injected 4 legitimate consumer transactions'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50"
            title="Generate legitimate consumer transactions"
          >
            <ShieldCheck size={13} />
            <span>+ Normal</span>
            {loadingAction === 'normal' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
          </button>

          {/* 2. Fraud Attack */}
          <button
            disabled={loadingAction !== null}
            onClick={() =>
              handleAction(
                'fraud',
                '/api/demo/simulate-fraud',
                '🚨 Fraud attack injected! Slack alert dispatched'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50 shadow-sm"
            title="Inject fraudulent transactions (fires Slack alert)"
          >
            <AlertOctagon size={13} />
            <span>Fraud Attack</span>
            {loadingAction === 'fraud' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
          </button>

          {/* 3. Smurfing */}
          <button
            disabled={loadingAction !== null}
            onClick={() =>
              handleAction(
                'smurfing',
                '/api/demo/simulate-smurfing',
                '🕸️ Smurfing ring injected! Laundering alert triggered'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 transition-all disabled:opacity-50"
            title="Simulate money laundering ring"
          >
            <Network size={13} />
            <span>Smurfing Ring</span>
            {loadingAction === 'smurfing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
          </button>

          {/* 4. Seed History */}
          <button
            disabled={loadingAction !== null}
            onClick={() =>
              handleAction(
                'seed',
                '/api/demo/seed-all',
                'Database seeded with fresh history'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] transition-all disabled:opacity-50"
            title="Reset & seed transaction history"
          >
            <RotateCcw size={13} />
            <span>Reset Seed</span>
            {loadingAction === 'seed' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
          </button>
        </div>

        {/* Right: Monitoring Shortcuts & Log Toggle */}
        <div className="flex items-center gap-1.5">
          <a
            href="http://localhost:3000/d/finguard-mlops-overview/finguard-threat-and-mlops-monitor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-all"
            title="Open Grafana Dashboard"
          >
            <span>Grafana</span>
            <ExternalLink size={10} />
          </a>

          <a
            href="http://localhost:9090/alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
            title="Open Prometheus Alerts"
          >
            <span>Alerts</span>
            <ExternalLink size={10} />
          </a>

          {/* Terminal Log Toggle */}
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent transition-all ${
              showLogs ? 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-blue-500' : ''
            }`}
            title={showLogs ? 'Hide activity log' : 'Show activity log'}
          >
            <Terminal size={14} />
          </button>
        </div>
      </div>

      {/* ── Optional Collapsible Activity Log ── */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 font-mono text-[11px] max-h-32 overflow-y-auto"
          >
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] uppercase mb-1 font-sans font-semibold">
              <span>Simulator Console</span>
              <button
                onClick={() => setLogs([])}
                className="hover:text-[var(--text-primary)] text-[10px]"
              >
                Clear Log
              </button>
            </div>
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 py-0.5 leading-relaxed">
                <span className="text-[var(--text-muted)]">[{log.time}]</span>
                <span
                  className={
                    log.type === 'error'
                      ? 'text-rose-500'
                      : log.type === 'success'
                      ? 'text-emerald-500'
                      : 'text-[var(--text-secondary)]'
                  }
                >
                  {log.msg}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
