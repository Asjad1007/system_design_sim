import React from 'react';
import type { ComponentType } from '../types';
import { COMPONENT_LABELS } from '../types';
import {
    Network,
    Server,
    Database,
    HardDrive,
    MessageSquare,
} from 'lucide-react';

const COMPONENT_ITEMS: {
    type: ComponentType;
    icon: React.ReactNode;
    color: string;
    bg: string;
    hoverBorder: string;
}[] = [
        {
            type: 'loadBalancer',
            icon: <Network size={18} />,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            hoverBorder: 'hover:border-blue-200',
        },
        {
            type: 'appServer',
            icon: <Server size={18} />,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            hoverBorder: 'hover:border-violet-200',
        },
        {
            type: 'database',
            icon: <Database size={18} />,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            hoverBorder: 'hover:border-amber-200',
        },
        {
            type: 'cache',
            icon: <HardDrive size={18} />,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            hoverBorder: 'hover:border-emerald-200',
        },
        {
            type: 'messageQueue',
            icon: <MessageSquare size={18} />,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            hoverBorder: 'hover:border-rose-200',
        },
    ];

const COMPONENT_DESCRIPTIONS: Record<ComponentType, string> = {
    loadBalancer: 'Distributes requests across servers',
    appServer: 'Processes application logic',
    database: 'Persistent data storage',
    cache: 'In-memory fast data access',
    messageQueue: 'Async message processing',
};

export default function Sidebar() {
    const onDragStart = (
        event: React.DragEvent,
        componentType: ComponentType
    ) => {
        event.dataTransfer.setData('application/component-type', componentType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Components
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Drag to canvas</p>
            </div>

            {/* Component List */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {COMPONENT_ITEMS.map(({ type, icon, color, bg, hoverBorder }) => (
                    <div
                        key={type}
                        draggable
                        onDragStart={(e) => onDragStart(e, type)}
                        className={`group flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-white border border-slate-100 ${hoverBorder} cursor-grab active:cursor-grabbing transition-all duration-150 hover:shadow-sm`}
                    >
                        <div className={`p-2 rounded-lg ${bg} ${color} transition-colors shrink-0`}>
                            {icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                {COMPONENT_LABELS[type]}
                            </p>
                            <p className="text-[11px] text-slate-400 leading-snug">
                                {COMPONENT_DESCRIPTIONS[type]}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
