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

const COMPONENT_ITEMS: { type: ComponentType; icon: React.ReactNode }[] = [
    { type: 'loadBalancer', icon: <Network size={20} /> },
    { type: 'appServer', icon: <Server size={20} /> },
    { type: 'database', icon: <Database size={20} /> },
    { type: 'cache', icon: <HardDrive size={20} /> },
    { type: 'messageQueue', icon: <MessageSquare size={20} /> },
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
        <div className="w-60 bg-white border-r border-slate-200/80 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200/80">
                <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    Components
                </h2>
            </div>

            {/* Component List */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {COMPONENT_ITEMS.map(({ type, icon }) => (
                    <div
                        key={type}
                        draggable
                        onDragStart={(e) => onDragStart(e, type)}
                        className="group flex items-start gap-3 p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-grab active:cursor-grabbing transition-all duration-150"
                    >
                        <div className="p-1.5 rounded-md bg-slate-100 text-slate-500 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                            {icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                {COMPONENT_LABELS[type]}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                {COMPONENT_DESCRIPTIONS[type]}
                            </p>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}
