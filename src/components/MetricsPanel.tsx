import { useSimStore } from '../store/useSimStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Activity,
    X,
    BarChart3,
} from 'lucide-react';
import { useState } from 'react';

export default function MetricsPanel() {
    const simulationState = useSimStore((s) => s.simulationState);
    const simulationResult = useSimStore((s) => s.simulationResult);
    const [isOpen, setIsOpen] = useState(false);

    if (simulationState !== 'complete' || !simulationResult) return null;

    const { totalPassed, totalFailed, detectedFailures, timeline } = simulationResult;
    const totalProcessed = totalPassed + totalFailed;
    const successRate = totalProcessed > 0 ? (totalPassed / totalProcessed) * 100 : 100;

    const chartData = timeline
        .filter((_, i) => i % 5 === 0)
        .map((snap) => {
            const nodeEntries = Object.entries(snap.nodes);
            const avgLatency =
                nodeEntries.reduce((sum, [, n]) => sum + n.metrics.latencyMs, 0) /
                Math.max(nodeEntries.length, 1);
            const totalThroughput = nodeEntries.reduce((sum, [, n]) => sum + n.metrics.throughput, 0);

            return {
                tick: snap.tick,
                latency: Math.round(avgLatency * 10) / 10,
                throughput: Math.round(totalThroughput),
            };
        });

    // ... imports

    return (
        <>
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setIsOpen(true)}
                    className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-md border border-slate-200 transition-all"
                >
                    <BarChart3 size={14} />
                    View Results
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 right-0 z-20 max-h-[60vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-t border-slate-200 rounded-t-2xl shadow-2xl"
                    >
                        <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <Activity size={18} className="text-accent" />
                                <h3 className="text-base font-semibold text-slate-800">Simulation Results</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <SummaryCard
                                    icon={<CheckCircle2 size={18} />}
                                    label="Passed"
                                    value={totalPassed.toLocaleString()}
                                    color="text-healthy"
                                    bgColor="bg-healthy/5"
                                />
                                <SummaryCard
                                    icon={<XCircle size={18} />}
                                    label="Failed"
                                    value={totalFailed.toLocaleString()}
                                    color="text-critical"
                                    bgColor="bg-critical/5"
                                />
                                <SummaryCard
                                    icon={<Activity size={18} />}
                                    label="Success Rate"
                                    value={`${successRate.toFixed(1)}%`}
                                    color={successRate > 90 ? 'text-healthy' : successRate > 50 ? 'text-degraded' : 'text-critical'}
                                    bgColor={successRate > 90 ? 'bg-healthy/5' : successRate > 50 ? 'bg-degraded/5' : 'bg-critical/5'}
                                />
                            </div>

                            {detectedFailures.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-degraded" />
                                        Detected Issues
                                    </h4>
                                    <div className="space-y-1.5">
                                        {detectedFailures.map((f, i) => (
                                            <div
                                                key={i}
                                                className="px-3 py-2 rounded-lg text-xs bg-critical/5 border border-critical/10 text-critical/80 font-medium"
                                            >
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Avg Latency (ms)
                                    </h4>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="tick" hide />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                }}
                                            />
                                            <Area type="monotone" dataKey="latency" stroke="#6366f1" fill="url(#latencyGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Throughput (req/tick)
                                    </h4>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="tick" hide />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                }}
                                            />
                                            <Area type="monotone" dataKey="throughput" stroke="#22c55e" fill="url(#throughputGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    color,
    bgColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    bgColor: string;
}) {
    return (
        <div className={`${bgColor} rounded-xl p-4 border border-slate-100 shadow-sm`}>
            <div className={`${color} mb-2`}>{icon}</div>
            <p className="text-2xl font-bold text-slate-800 font-mono">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
    );
}
