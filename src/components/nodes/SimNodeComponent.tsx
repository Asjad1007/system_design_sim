import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { SimNodeData, HealthState } from '../../types';
import {
    Network,
    Server,
    Database,
    HardDrive,
    MessageSquare,
    Settings,
} from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
    loadBalancer: <Network size={22} />,
    appServer: <Server size={22} />,
    database: <Database size={22} />,
    cache: <HardDrive size={22} />,
    messageQueue: <MessageSquare size={22} />,
};

const HEALTH_STYLES: Record<HealthState, string> = {
    healthy: 'border-healthy/40 shadow-glow-green bg-white/80',
    degraded: 'border-degraded/40 shadow-glow-yellow bg-white/80',
    critical: 'border-critical/40 shadow-glow-red animate-pulse bg-white/80',
    failed: 'border-failed bg-failed/10 shadow-glow-red animate-pulse',
};

const HEALTH_ICON_STYLES: Record<HealthState, string> = {
    healthy: 'bg-healthy/10 text-healthy',
    degraded: 'bg-degraded/10 text-degraded',
    critical: 'bg-critical/10 text-critical',
    failed: 'bg-failed/10 text-critical',
};

type SimNodeType = Node<SimNodeData, 'simNode'>;

function SimNodeComponent({ data, selected }: NodeProps<SimNodeType>) {
    const healthStyle = HEALTH_STYLES[data.health];
    const iconStyle = HEALTH_ICON_STYLES[data.health];

    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-accent !border-2 !border-white"
            />
            <div
                className={`
          group/node relative px-4 py-3 rounded-2xl border-2 backdrop-blur-xl
          min-w-[160px] cursor-pointer
          transition-all duration-300
          ${healthStyle}
          ${selected ? 'ring-2 ring-accent/50 border-accent' : 'border-slate-200'}
        `}
            >
                {/* Config hint — visible on hover */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/node:opacity-100 transition-opacity duration-200">
                    <div className="p-1 rounded-md bg-slate-100/80 text-slate-400 hover:text-accent hover:bg-accent/10 transition-colors">
                        <Settings size={12} />
                    </div>
                </div>
                {/* Icon + Label */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors duration-300 ${iconStyle}`}>
                        {ICONS[data.componentType]}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                            {data.label}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {data.componentType.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                    </div>
                </div>

                {/* Metrics Bar (visible during/after simulation) */}
                {data.metrics.currentLoad > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Load</span>
                            <span className="text-slate-600 font-mono">
                                {Math.round(data.metrics.currentLoad)} rps
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Latency</span>
                            <span className="text-slate-600 font-mono">
                                {data.metrics.latencyMs.toFixed(1)} ms
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Errors</span>
                            <span className={`font-mono ${data.metrics.errorRate > 0.05 ? 'text-critical' : 'text-slate-600'}`}>
                                {(data.metrics.errorRate * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Health indicator dot */}
                <div
                    className={`
            absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
            ${data.health === 'healthy' ? 'bg-healthy' : ''}
            ${data.health === 'degraded' ? 'bg-degraded' : ''}
            ${data.health === 'critical' ? 'bg-critical' : ''}
            ${data.health === 'failed' ? 'bg-failed' : ''}
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
