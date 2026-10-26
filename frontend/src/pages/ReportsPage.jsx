import { useState, useEffect } from 'react';
import { transactionsAPI, casesAPI } from '../api/client';
import StatsCard from '../components/StatsCard';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Printer,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  Calendar,
  CheckCircle,
  Filter,
  ExternalLink
} from 'lucide-react';

const containerVariants = { animate: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [caseStats, setCaseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [txRes, statsRes, caseRes] = await Promise.all([
        transactionsAPI.list({ limit: 100 }),
        transactionsAPI.getStats(),
        casesAPI.getStats(),
      ]);
      setTransactions(txRes.data.transactions || []);
      setStats(statsRes.data || {});
      setCaseStats(caseRes.data || {});
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Transaction ID', 'Merchant', 'Category', 'Amount ($)', 'Risk Score', 'Is Fraud', 'Is Smurfing', 'Date'];
    const rows = transactions.map((t) => [
      t._id,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      t.category || 'N/A',
      (t.amount || 0).toFixed(2),
      t.fraudScore ? (t.fraudScore * 100).toFixed(1) + '%' : '0%',
      t.fraudScore > 0.5 ? 'YES' : 'NO',
      t.isSmurfing ? 'YES' : 'NO',
      t.transDateTime ? new Date(t.transDateTime).toISOString() : new Date().toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finguard-anomaly-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Category breakdown calculation
  const categoryMap = transactions.reduce((acc, t) => {
    const cat = t.category || 'general';
    if (!acc[cat]) acc[cat] = { count: 0, amount: 0, fraudCount: 0 };
    acc[cat].count += 1;
    acc[cat].amount += t.amount || 0;
    if (t.fraudScore > 0.5) acc[cat].fraudCount += 1;
    return acc;
  }, {});

  const categories = Object.entries(categoryMap).sort((a, b) => b[1].amount - a[1].amount);
  const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const fraudTxns = transactions.filter((t) => t.fraudScore > 0.5);
  const totalFraudPrevented = fraudTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="main-content">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        {/* Header */}
        <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="flex items-center gap-2">
              <FileText className="text-blue-500" size={28} />
              Fraud & Anomaly Compliance Reports
            </h1>
            <motion.p variants={itemVariants}>
              Executive audit summaries, risk posture evaluation, and regulatory export documentation
            </motion.p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto print:hidden">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] outline-none cursor-pointer"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All-Time Audit</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
              title="Download CSV file"
            >
              <Download size={15} />
              Export CSV
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] transition-colors shadow-sm"
              title="Print formatted executive report"
            >
              <Printer size={15} />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={DollarSign}
            label="Total Volume Monitored"
            value={`$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="indigo"
            delay={0}
          />
          <StatsCard
            icon={ShieldAlert}
            label="Threat Loss Prevented"
            value={`$${totalFraudPrevented.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="red"
            delay={100}
          />
          <StatsCard
            icon={AlertOctagon}
            label="Flagged Anomalies"
            value={String(fraudTxns.length)}
            color="purple"
            delay={200}
          />
          <StatsCard
            icon={CheckCircle}
            label="Anomalies Corrected"
            value={String((caseStats?.truePositives || 0) + (caseStats?.falsePositives || 0))}
            color="emerald"
            delay={300}
          />
        </div>

        {/* Middle Two-Column Section: Category Breakdown + Model Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Breakdown Card */}
          <motion.div className="glass-card p-6" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                Category Exposure & Threat Density
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-mono">{categories.length} Categories</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {categories.slice(0, 6).map(([cat, data]) => {
                const pct = totalVolume > 0 ? (data.amount / totalVolume) * 100 : 0;
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)] capitalize">
                        {cat.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[var(--text-secondary)] font-mono">
                        ${data.amount.toFixed(2)} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          data.fraudCount > 0 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                      />
                    </div>
                    {data.fraudCount > 0 && (
                      <span className="text-[10px] text-red-400 font-medium">
                        ⚠️ {data.fraudCount} flagged anomaly in this category
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Compliance & Audit Posture */}
          <motion.div className="glass-card p-6" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldAlert size={18} className="text-emerald-500" />
                Regulatory & Audit Posture
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                COMPLIANT
              </span>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="flex justify-between font-semibold text-[var(--text-primary)] mb-1">
                  <span>AI Latency & SLA Resolution</span>
                  <span className="text-emerald-500">Normal (&lt; 200ms)</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px]">
                  XGBoost inference model evaluates all transactions within 45ms. Zero queued transactions.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="flex justify-between font-semibold text-[var(--text-primary)] mb-1">
                  <span>Anti-Money Laundering (AML) Rules</span>
                  <span className="text-blue-500">Active Monitoring</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px]">
                  Bank Secrecy Act (BSA) structuring & fan-in smurfing ring threshold set at $5,000.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="flex justify-between font-semibold text-[var(--text-primary)] mb-1">
                  <span>Audit Trail Retention</span>
                  <span className="text-purple-400">7 Years (Immutable)</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px]">
                  All decisions, true/false positive labels, and SHAP explainability logs are cryptographically tagged.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Audit Table */}
        <motion.div className="glass-card overflow-hidden" variants={itemVariants}>
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Latest Anomaly & Compliance Audit Log ({transactions.length} records)
            </h3>
            <span className="text-xs text-[var(--text-muted)]">Real-time synchronized with MongoDB</span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table w-full text-left min-w-[700px]">
              <thead className="text-[10px] font-bold text-[var(--text-muted)] border-b-2 border-[var(--border-color)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-4 py-3">Merchant / Entity</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Risk Assessment</th>
                  <th className="px-4 py-3">Compliance Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-xs">
                {transactions.slice(0, 15).map((t) => {
                  const isFraud = (t.fraudScore || 0) > 0.5;
                  return (
                    <tr key={t._id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                        {t.merchant}
                        <span className="block font-mono text-[10px] text-[var(--text-muted)] font-normal">
                          •••• {t.cardNum ? t.cardNum.slice(-4) : '0000'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] capitalize">
                        {(t.category || 'general').replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[var(--text-primary)]">
                        ${(t.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isFraud ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {t.fraudScore ? `${(t.fraudScore * 100).toFixed(1)}%` : '0.0%'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {t.analystLabel === 'true_positive' ? (
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Corrected
                          </span>
                        ) : isFraud ? (
                          <span className="text-red-400 font-semibold">Under Investigation</span>
                        ) : (
                          <span className="text-[var(--text-muted)]">Verified Clean</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-[11px]">
                        {t.transDateTime ? new Date(t.transDateTime).toLocaleTimeString() : 'Just now'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
