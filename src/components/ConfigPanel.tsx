import { useSimStore } from '../store/useSimStore';
import type {
    NodeConfig,
    LoadBalancerConfig,
    AppServerConfig,
    DatabaseConfig,
    CacheConfig,
    MessageQueueConfig,
    ComponentType,
} from '../types';
import { X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ConfigPanel() {
    const nodes = useSimStore((s) => s.nodes);
    const selectedNodeId = useSimStore((s) => s.selectedNodeId);
    const updateNodeConfig = useSimStore((s) => s.updateNodeConfig);
    const selectNode = useSimStore((s) => s.selectNode);
    const removeNode = useSimStore((s) => s.removeNode);
    const simulationState = useSimStore((s) => s.simulationState);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    return (
        <AnimatePresence>
            {selectedNode && (
                <motion.div
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    className="w-80 bg-white backdrop-blur-xl border-l border-slate-200 flex flex-col overflow-y-auto shadow-lg"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Configure: {selectedNode.data.label}
                        </h3>
                        <div className="flex gap-1">
                            <button
                                onClick={() => {
                                    removeNode(selectedNode.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-critical hover:bg-critical/10 transition-colors"
                                title="Delete node"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button
                                onClick={() => selectNode(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Config Form */}
                    <div className="p-4 space-y-4">
                        {simulationState === 'running' && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium">
                                Configuration locked during simulation
                            </div>
                        )}
                        <ConfigForm
                            componentType={selectedNode.data.componentType}
                            config={selectedNode.data.config}
                            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
                            disabled={simulationState === 'running'}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Dynamic Config Form ─────────────────────────────────────

function ConfigForm({
    componentType,
    config,
    onChange,
    disabled,
}: {
    componentType: ComponentType;
    config: NodeConfig;
    onChange: (c: NodeConfig) => void;
    disabled: boolean;
}) {
    switch (componentType) {
        case 'loadBalancer':
            return <LBForm config={config as LoadBalancerConfig} onChange={onChange} disabled={disabled} />;
        case 'appServer':
            return <AppServerForm config={config as AppServerConfig} onChange={onChange} disabled={disabled} />;
        case 'database':
            return <DBForm config={config as DatabaseConfig} onChange={onChange} disabled={disabled} />;
        case 'cache':
            return <CacheForm config={config as CacheConfig} onChange={onChange} disabled={disabled} />;
        case 'messageQueue':
            return <MQForm config={config as MessageQueueConfig} onChange={onChange} disabled={disabled} />;
    }
}

// ─── Shared UI ──────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    );
}

const INPUT_CLASS =
    'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all disabled:opacity-50 disabled:bg-slate-50 shadow-sm';

// ─── NumberInput — allows clearing the field to retype ──────
function NumberInput({
    value,
    onValueChange,
    disabled,
    min,
    max,
    step,
    className,
    placeholder,
}: {
    value: number;
    onValueChange: (v: number) => void;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    placeholder?: string;
}) {
    const [localValue, setLocalValue] = useState(String(value));

    useEffect(() => {
        setLocalValue(String(value));
    }, [value]);

    return (
        <input
            type="number"
            className={className ?? INPUT_CLASS}
            value={localValue}
            onChange={(e) => {
                setLocalValue(e.target.value);
                const num = Number(e.target.value);
                if (e.target.value !== '' && !isNaN(num)) {
                    onValueChange(num);
                }
            }}
            onBlur={() => {
                if (localValue === '' || isNaN(Number(localValue))) {
                    const fallback = min ?? 0;
                    setLocalValue(String(fallback));
                    onValueChange(fallback);
                }
            }}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
        />
    );
}

const SELECT_CLASS =
    'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 appearance-none disabled:opacity-50 disabled:bg-slate-50 shadow-sm';

const TOGGLE_CLASS = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 shadow-inner';

function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled: boolean;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`${TOGGLE_CLASS} ${checked ? 'bg-accent' : 'bg-slate-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}

// ─── Load Balancer Form ─────────────────────────────────────

function LBForm({
    config,
    onChange,
    disabled,
}: {
    config: LoadBalancerConfig;
    onChange: (c: NodeConfig) => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-4">
            <Field label="Algorithm">
                <select
                    className={SELECT_CLASS}
                    value={config.algorithm}
                    onChange={(e) => onChange({ ...config, algorithm: e.target.value as LoadBalancerConfig['algorithm'] })}
                    disabled={disabled}
                >
                    <option value="roundRobin">Round Robin</option>
                    <option value="leastConnections">Least Connections</option>
                    <option value="random">Random</option>
                </select>
            </Field>
            <Field label="Max Connections/Sec">
                <NumberInput
                    value={config.maxConnectionsPerSecond}
                    onValueChange={(v) => onChange({ ...config, maxConnectionsPerSecond: v })}
                    disabled={disabled}
                    min={100}
                    step={100}
                />
            </Field>
            <Field label="Health Check">
                <Toggle
                    checked={config.healthCheckEnabled}
                    onChange={(v) => onChange({ ...config, healthCheckEnabled: v })}
                    disabled={disabled}
                />
            </Field>
        </div>
    );
}

// ─── App Server Form ────────────────────────────────────────

function AppServerForm({
    config,
    onChange,
    disabled,
}: {
    config: AppServerConfig;
    onChange: (c: NodeConfig) => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-4">
            <Field label="Instances">
                <NumberInput
                    value={config.instances}
                    onValueChange={(v) => onChange({ ...config, instances: v })}
                    disabled={disabled}
                    min={1}
                    max={100}
                />
            </Field>
            <Field label="CPU Cores (per instance)">
                <NumberInput
                    value={config.cpuCores}
                    onValueChange={(v) => onChange({ ...config, cpuCores: v })}
                    disabled={disabled}
                    min={1}
                    max={64}
                />
            </Field>
            <Field label="Memory (MB)">
                <NumberInput
                    value={config.memoryMb}
                    onValueChange={(v) => onChange({ ...config, memoryMb: v })}
                    disabled={disabled}
                    min={256}
                    step={256}
                />
            </Field>
            <Field label="Max Concurrent Requests (per instance)">
                <NumberInput
                    value={config.maxConcurrentRequests}
                    onValueChange={(v) => onChange({ ...config, maxConcurrentRequests: v })}
                    disabled={disabled}
                    min={10}
                    step={10}
                />
            </Field>
            <Field label="Processing Time (ms)">
                <NumberInput
                    value={config.processingTimeMs}
                    onValueChange={(v) => onChange({ ...config, processingTimeMs: v })}
                    disabled={disabled}
                    min={1}
                    max={5000}
                />
            </Field>
        </div>
    );
}

// ─── Database Form ──────────────────────────────────────────

function DBForm({
    config,
    onChange,
    disabled,
}: {
    config: DatabaseConfig;
    onChange: (c: NodeConfig) => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-4">
            <Field label="Type">
                <select
                    className={SELECT_CLASS}
                    value={config.dbType}
                    onChange={(e) => onChange({ ...config, dbType: e.target.value as 'sql' | 'nosql' })}
                    disabled={disabled}
                >
                    <option value="sql">SQL (Relational)</option>
                    <option value="nosql">NoSQL (Document)</option>
                </select>
            </Field>
            <Field label="Read/Write Profile">
                <select
                    className={SELECT_CLASS}
                    value={config.readWriteProfile}
                    onChange={(e) => onChange({ ...config, readWriteProfile: e.target.value as DatabaseConfig['readWriteProfile'] })}
                    disabled={disabled}
                >
                    <option value="readHeavy">Read Heavy</option>
                    <option value="writeHeavy">Write Heavy</option>
                    <option value="balanced">Balanced</option>
                </select>
            </Field>
            <Field label="Sharding">
                <div className="flex items-center gap-3">
                    <Toggle
                        checked={config.sharding}
                        onChange={(v) => onChange({ ...config, sharding: v, shardCount: v ? Math.max(config.shardCount, 2) : 1 })}
                        disabled={disabled}
                    />
                    {config.sharding && (
                        <NumberInput
                            className={`${INPUT_CLASS} w-20`}
                            value={config.shardCount}
                            onValueChange={(v) => onChange({ ...config, shardCount: v })}
                            disabled={disabled}
                            min={2}
                            max={64}
                            placeholder="Shards"
                        />
                    )}
                </div>
            </Field>
            <Field label="Replication">
                <select
                    className={SELECT_CLASS}
                    value={config.replication}
                    onChange={(e) => onChange({ ...config, replication: e.target.value as DatabaseConfig['replication'], replicaCount: e.target.value !== 'none' ? Math.max(config.replicaCount, 1) : 0 })}
                    disabled={disabled}
                >
                    <option value="none">None</option>
                    <option value="sync">Synchronous</option>
                    <option value="async">Asynchronous</option>
                </select>
            </Field>
            {config.replication !== 'none' && (
                <Field label="Replica Count">
                    <NumberInput
                        value={config.replicaCount}
                        onValueChange={(v) => onChange({ ...config, replicaCount: v })}
                        disabled={disabled}
                        min={1}
                        max={10}
                    />
                </Field>
            )}
            <Field label="Max Connection Pool">
                <NumberInput
                    value={config.maxConnectionPool}
                    onValueChange={(v) => onChange({ ...config, maxConnectionPool: v })}
                    disabled={disabled}
                    min={10}
                    step={10}
                />
            </Field>
            <Field label="Base Query Time (ms)">
                <NumberInput
                    value={config.baseQueryTimeMs}
                    onValueChange={(v) => onChange({ ...config, baseQueryTimeMs: v })}
                    disabled={disabled}
                    min={1}
                    max={1000}
                />
            </Field>
        </div>
    );
}

// ─── Cache Form ─────────────────────────────────────────────

function CacheForm({
    config,
    onChange,
    disabled,
}: {
    config: CacheConfig;
    onChange: (c: NodeConfig) => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-4">
            <Field label="Eviction Strategy">
                <select
                    className={SELECT_CLASS}
                    value={config.strategy}
                    onChange={(e) => onChange({ ...config, strategy: e.target.value as CacheConfig['strategy'] })}
                    disabled={disabled}
                >
                    <option value="lru">LRU (Least Recently Used)</option>
                    <option value="lfu">LFU (Least Frequently Used)</option>
                    <option value="ttl">TTL (Time-to-Live)</option>
                </select>
            </Field>
            <Field label="Max Memory (MB)">
                <NumberInput
                    value={config.maxMemoryMb}
                    onValueChange={(v) => onChange({ ...config, maxMemoryMb: v })}
                    disabled={disabled}
                    min={64}
                    step={64}
                />
            </Field>
            <Field label="TTL (seconds)">
                <NumberInput
                    value={config.ttlSeconds}
                    onValueChange={(v) => onChange({ ...config, ttlSeconds: v })}
                    disabled={disabled}
                    min={1}
                />
            </Field>
            <Field label={`Hit Rate: ${(config.hitRate * 100).toFixed(0)}%`}>
                <input
                    type="range"
                    className="w-full accent-accent"
                    value={config.hitRate}
                    onChange={(e) => onChange({ ...config, hitRate: Number(e.target.value) })}
                    disabled={disabled}
                    min={0}
                    max={1}
                    step={0.05}
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%</span>
                    <span>100%</span>
                </div>
            </Field>
            <Field label="Max Ops/Sec">
                <NumberInput
                    value={config.maxOpsPerSecond}
                    onValueChange={(v) => onChange({ ...config, maxOpsPerSecond: v })}
                    disabled={disabled}
                    min={100}
                    step={100}
                />
            </Field>
        </div>
    );
}

// ─── Message Queue Form ─────────────────────────────────────

function MQForm({
    config,
    onChange,
    disabled,
}: {
    config: MessageQueueConfig;
    onChange: (c: NodeConfig) => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-4">
            <Field label="Max Queue Depth">
                <NumberInput
                    value={config.maxQueueDepth}
                    onValueChange={(v) => onChange({ ...config, maxQueueDepth: v })}
                    disabled={disabled}
                    min={100}
                    step={100}
                />
            </Field>
            <Field label="Processing Rate/Sec">
                <NumberInput
                    value={config.processingRatePerSecond}
                    onValueChange={(v) => onChange({ ...config, processingRatePerSecond: v })}
                    disabled={disabled}
                    min={10}
                    step={10}
                />
            </Field>
            <Field label="Retry Policy">
                <select
                    className={SELECT_CLASS}
                    value={config.retryPolicy}
                    onChange={(e) => onChange({ ...config, retryPolicy: e.target.value as MessageQueueConfig['retryPolicy'] })}
                    disabled={disabled}
                >
                    <option value="none">None</option>
                    <option value="fixed">Fixed Delay</option>
                    <option value="exponentialBackoff">Exponential Backoff</option>
                </select>
            </Field>
            {config.retryPolicy !== 'none' && (
                <Field label="Max Retries">
                    <NumberInput
                        value={config.maxRetries}
                        onValueChange={(v) => onChange({ ...config, maxRetries: v })}
                        disabled={disabled}
                        min={1}
                        max={10}
                    />
                </Field>
            )}
            <Field label="Dead-Letter Queue">
                <Toggle
                    checked={config.dlqEnabled}
                    onChange={(v) => onChange({ ...config, dlqEnabled: v })}
                    disabled={disabled}
                />
            </Field>
        </div>
    );
}
