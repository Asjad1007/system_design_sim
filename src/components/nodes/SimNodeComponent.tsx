import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { SimNodeData, HealthState, ComponentType } from '../../types';
import { useSimStore } from '../../store/useSimStore';
import {
    Network,
    Server,
    Database,
    HardDrive,
    MessageSquare,
    Settings,
    Trash2,
} from 'lucide-react';

// Color-coded icons per component type
const COMPONENT_COLORS: Record<ComponentType, { icon: React.ReactNode; color: string; bg: string }> = {
    loadBalancer: { icon: <Network size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    appServer: { icon: <Server size={20} />, color: 'text-violet-600', bg: 'bg-violet-50' },
    database: { icon: <Database size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    cache: { icon: <HardDrive size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    messageQueue: { icon: <MessageSquare size={20} />, color: 'text-rose-600', bg: 'bg-rose-50' },
};

const HEALTH_STYLES: Record<HealthState, string> = {
    healthy: 'border-healthy/50 shadow-glow-green bg-white',
    degraded: 'border-degraded/50 shadow-glow-yellow bg-white',
    critical: 'border-critical/50 shadow-glow-red animate-pulse bg-white',
    failed: 'border-failed bg-red-50 shadow-glow-red animate-pulse',
};

const HEALTH_DOT: Record<HealthState, string> = {
    healthy: 'bg-healthy',
    degraded: 'bg-degraded',
    critical: 'bg-critical',
    failed: 'bg-failed',
};

type SimNodeType = Node<SimNodeData, 'simNode'>;

function SimNodeComponent({ data, selected, id }: NodeProps<SimNodeType>) {
    const healthStyle = HEALTH_STYLES[data.health];
    const comp = COMPONENT_COLORS[data.componentType];
    const selectNode = useSimStore((s) => s.selectNode);
    const removeNode = useSimStore((s) => s.removeNode);

    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-accent !border-2 !border-white"
            />
            <div
                className={`
          group/node relative px-4 py-3 rounded-2xl border-2
          min-w-[160px] cursor-pointer
          transition-all duration-300
          ${healthStyle}
          ${selected ? 'ring-2 ring-accent/40 border-accent' : 'border-slate-200'}
        `}
            >
                {/* Action buttons — float above the top-right corner, visible on hover */}
                <div className="absolute -top-4 -right-2 flex gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            selectNode(id);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-accent hover:border-accent/40 shadow-sm transition-colors"
                        title="Configure"
                    >
                        <Settings size={12} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeNode(id);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 shadow-sm transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>

                {/* Icon + Label */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${comp.bg} ${comp.color} transition-colors duration-300`}>
                        {comp.icon}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {data.label}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            {data.componentType.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                    </div>
                </div>

                {/* Metrics Bar (visible during/after simulation) */}
                {data.metrics.currentLoad > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 font-medium">Load</span>
                            <span className="text-slate-700 font-mono font-medium">
                                {Math.round(data.metrics.currentLoad)} rps
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 font-medium">Latency</span>
                            <span className="text-slate-700 font-mono font-medium">
                                {data.metrics.latencyMs.toFixed(1)} ms
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400 font-medium">Errors</span>
                            <span className={`font-mono font-medium ${data.metrics.errorRate > 0.05 ? 'text-critical' : 'text-slate-700'}`}>
                                {(data.metrics.errorRate * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Health indicator dot */}
                <div
                    className={`
            absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
            ${HEALTH_DOT[data.health]}
          `}
                />
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-accent !border-2 !border-white"
            />
        </>
    );
}

export default memo(SimNodeComponent);
