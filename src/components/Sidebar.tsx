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
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Components
                </h2>
                <p className="text-xs text-slate-500 mt-1">Drag onto canvas</p>
            </div>

            {/* Component List */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {COMPONENT_ITEMS.map(({ type, icon }) => (
                    <div
                        key={type}
                        draggable
                        onDragStart={(e) => onDragStart(e, type)}
                        className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-accent/40 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md"
                    >
                        <div className="p-2 rounded-lg bg-white border border-slate-100 text-accent group-hover:bg-accent/5 transition-colors shadow-sm">
                            {icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 group-hover:text-accent transition-colors">
                                {COMPONENT_LABELS[type]}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {COMPONENT_DESCRIPTIONS[type]}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                <p className="text-xs text-slate-400 text-center">
                    Connect nodes to define data flow
                </p>
            </div>
        </div>
    );
}
