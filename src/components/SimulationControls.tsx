import { useState } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Play, RotateCcw, Zap } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function SimulationControls() {
    const simulationState = useSimStore((s) => s.simulationState);
    const requestCount = useSimStore((s) => s.requestCount);
    const setRequestCount = useSimStore((s) => s.setRequestCount);
    const startSimulation = useSimStore((s) => s.startSimulation);
    const resetSimulation = useSimStore((s) => s.resetSimulation);
    const setNodes = useSimStore((s) => s.setNodes);
    const setEdges = useSimStore((s) => s.setEdges);
    const nodes = useSimStore((s) => s.nodes);
    const currentTick = useSimStore((s) => s.currentTick);
    const simulationResult = useSimStore((s) => s.simulationResult);
    const [showConfirm, setShowConfirm] = useState(false);

    const progress = simulationResult
        ? Math.min((currentTick / simulationResult.durationTicks) * 100, 100)
        : 0;

    const handleReset = () => {
        setShowConfirm(true);
    };

    const confirmReset = () => {
        resetSimulation();
        setNodes([]);
        setEdges([]);
        setShowConfirm(false);
    };

    return (
        <>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4">
                    {/* Request Count */}
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-accent" />
                        <label className="text-xs text-slate-500 whitespace-nowrap">Requests</label>
                        <input
                            type="number"
                            className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 disabled:opacity-50 text-center font-mono"
                            value={requestCount}
                            onChange={(e) => setRequestCount(Math.max(1, Number(e.target.value)))}
                            disabled={simulationState === 'running'}
                            min={1}
                            step={1000}
                        />
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-slate-200" />

                    {/* Progress bar (during simulation) */}
                    {simulationState === 'running' && (
                        <div className="w-32">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-100"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-1">
                                {Math.round(progress)}%
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    {simulationState === 'idle' && (
                        <button
                            onClick={startSimulation}
                            disabled={nodes.length === 0}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Play size={14} />
                            Start Simulation
                        </button>
                    )}

                    {simulationState === 'complete' && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all duration-200 border border-red-200"
                        >
                            <RotateCcw size={14} />
                            Reset
                        </button>
                    )}

                    {simulationState === 'running' && (
                        <div className="flex items-center gap-2 text-accent text-sm font-medium">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            Simulating...
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                title="Clear Canvas"
                message="This will remove all components and connections from the canvas. This action cannot be undone."
                confirmLabel="Clear Everything"
                cancelLabel="Cancel"
                onConfirm={confirmReset}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
}
