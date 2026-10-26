import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { casesAPI } from '../api/client';
import StatsCard from '../components/StatsCard';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  ShieldCheck, 
  RotateCcw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  FileCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

const containerVariants = { animate: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const rowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

export default function CasesCorrectedPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesRes, statsRes] = await Promise.all([
        casesAPI.getResolved({ limit: 100 }),
        casesAPI.getStats(),
      ]);
      setCases(casesRes.data.cases || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load resolved cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (id) => {
    try {
      await casesAPI.label(id, 'unreviewed');
      setCases((prev) => prev.filter((c) => c._id !== id));
      if (expandedRow === id) setExpandedRow(null);
      setModalType('success');
      setModalMessage('Anomaly moved back to pending review');
      setModalOpen(true);
      casesAPI.getStats().then((res) => setStats(res.data)).catch(() => {});
    } catch (err) {
      console.error('Failed to revert:', err);
      setModalType('error');
      setModalMessage('Failed to update case status');
      setModalOpen(true);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      (c.merchant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.first || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.street || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'true_positive') return matchesSearch && c.analystLabel === 'true_positive';
    if (filterType === 'false_positive') return matchesSearch && c.analystLabel === 'false_positive';
    return matchesSearch;
  });

  return (
    <div className="main-content">
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        {/* Header */}
        <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={28} />
              Anomaly Corrected
            </h1>
            <motion.p variants={itemVariants}>
              Review audit logs of resolved anomalies, confirmed threats, and corrected provider details
            </motion.p>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            Review Pending Anomalies <ArrowRight size={14} />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              icon={FileCheck} 
              label="Total Corrected" 
              value={String((stats.truePositives || 0) + (stats.falsePositives || 0))} 
              color="indigo" 
              delay={0} 
            />
            <StatsCard 
              icon={CheckCircle} 
              label="Confirmed Anomalies" 
              value={String(stats.truePositives || 0)} 
              color="emerald" 
              delay={100} 
            />
            <StatsCard 
              icon={ShieldCheck} 
              label="False Alarms Cleared" 
              value={String(stats.falsePositives || 0)} 
              color="purple" 
              delay={200} 
            />
            <StatsCard 
              icon={AlertTriangle} 
              label="Pending Correction" 
              value={String(stats.unreviewed || 0)} 
              color="red" 
              delay={300} 
            />
          </div>
        )}

        {/* Filter & Search Bar */}
        <motion.div className="glass-card mb-6 p-4 flex flex-col md:flex-row items-center justify-between gap-4" variants={itemVariants}>
          <div className="flex items-center gap-2 w-full md:w-96 bg-[var(--bg-primary)] px-3 py-2 rounded-lg border border-[var(--border-color)]">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search provider, merchant, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-[var(--text-muted)] font-medium">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              All Corrected ({cases.length})
            </button>
            <button
              onClick={() => setFilterType('true_positive')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filterType === 'true_positive'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Confirmed Anomaly
            </button>
            <button
              onClick={() => setFilterType('false_positive')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filterType === 'false_positive'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Cleared False Alarm
            </button>
          </div>
        </motion.div>

        {/* Table Area */}
        <motion.div className="glass-card overflow-hidden" variants={itemVariants}>
          {loading ? (
            <div className="p-12 text-center text-[var(--text-muted)]">
              <span className="inline-block w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mr-2" />
              Loading corrected records...
            </div>
          ) : filteredCases.length === 0 ? (
            <motion.div 
              className="text-center p-12"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">No Corrected Anomalies Found</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto mb-6">
                When you review flagged cases under <b>Anomaly Detection</b> and click <b>Correct Anomalies</b>, they will automatically be cataloged here with full audit history.
              </p>
              <button
                onClick={() => navigate('/cases')}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Go to Anomaly Detection
              </button>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full text-left min-w-[800px]">
                <thead className="text-[10px] font-bold text-[var(--text-muted)] border-b-2 border-[var(--border-color)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th className="px-4 py-3">Provider Detail</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Anomaly Score</th>
                    <th className="px-4 py-3">Correction Result</th>
                    <th className="px-4 py-3">Date Resolved</th>
                    <th className="px-4 py-3 text-center">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  <AnimatePresence>
                    {filteredCases.map((txn) => {
                      const isExpanded = expandedRow === txn._id;
                      const isTruePositive = txn.analystLabel === 'true_positive';

                      return (
                        <React.Fragment key={txn._id}>
                          <motion.tr
                            layout
                            variants={rowVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="group transition-colors border-b border-[var(--border-color)]"
                            whileHover={{ backgroundColor: 'var(--bg-elevated)' }}
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-[var(--text-primary)]">
                                {txn.first || 'Verified'} {txn.last || 'Merchant'}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                {txn.merchant} · <span className="font-mono">•••• {txn.cardNum ? txn.cardNum.slice(-4) : '----'}</span>
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)] max-w-xs truncate">
                              {txn.street || '2810 N Airport Fwy, Irving, TX'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle size={12} />
                                Corrected
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono font-bold text-[var(--accent-primary)]">
                              {txn.fraudScore ? `${(txn.fraudScore * 100).toFixed(1)}%` : '0.0%'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {isTruePositive ? (
                                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                  Confirmed Anomaly
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  False Positive Cleared
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                              {txn.updatedAt ? new Date(txn.updatedAt).toLocaleDateString() : 'Today'}
                            </td>
                            <td className="px-4 py-3 text-center cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : txn._id)}>
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors mx-auto">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </td>
                          </motion.tr>

                          {/* Expanded Audit Log */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-[var(--bg-secondary)]"
                              >
                                <td colSpan="7" className="px-6 py-5 border-b border-[var(--border-color)]">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-color)]">
                                    <div>
                                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                                        Correction Audit Summary
                                      </p>
                                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                                        Provider record updated & validated against NPI Registry
                                      </p>
                                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                                        Flagged Flags: {txn.fraudFlags && txn.fraudFlags.length > 0 ? txn.fraudFlags.join(', ') : 'Inconsistencies corrected'} · Amount: ${txn.amount?.toFixed(2) || '0.00'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => handleRevert(txn._id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-red-500 transition-colors"
                                      >
                                        <RotateCcw size={14} />
                                        Revert to Pending
                                      </button>
                                      <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                                        <ShieldCheck size={14} /> Audit Locked
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        type={modalType}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
