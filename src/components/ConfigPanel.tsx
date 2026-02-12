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
                    className="w-80 bg-white/90 backdrop-blur-xl border-l border-slate-200 flex flex-col overflow-y-auto shadow-xl"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
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
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.maxConnectionsPerSecond}
                    onChange={(e) => onChange({ ...config, maxConnectionsPerSecond: Number(e.target.value) })}
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
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.instances}
                    onChange={(e) => onChange({ ...config, instances: Number(e.target.value) })}
                    disabled={disabled}
                    min={1}
                    max={100}
                />
            </Field>
            <Field label="CPU Cores (per instance)">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.cpuCores}
                    onChange={(e) => onChange({ ...config, cpuCores: Number(e.target.value) })}
                    disabled={disabled}
                    min={1}
                    max={64}
                />
            </Field>
            <Field label="Memory (MB)">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.memoryMb}
                    onChange={(e) => onChange({ ...config, memoryMb: Number(e.target.value) })}
                    disabled={disabled}
                    min={256}
                    step={256}
                />
            </Field>
            <Field label="Max Concurrent Requests (per instance)">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.maxConcurrentRequests}
                    onChange={(e) => onChange({ ...config, maxConcurrentRequests: Number(e.target.value) })}
                    disabled={disabled}
                    min={10}
                    step={10}
                />
            </Field>
            <Field label="Processing Time (ms)">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.processingTimeMs}
                    onChange={(e) => onChange({ ...config, processingTimeMs: Number(e.target.value) })}
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
                        <input
                            type="number"
                            className={`${INPUT_CLASS} w-20`}
                            value={config.shardCount}
                            onChange={(e) => onChange({ ...config, shardCount: Number(e.target.value) })}
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
                    <input
                        type="number"
                        className={INPUT_CLASS}
                        value={config.replicaCount}
                        onChange={(e) => onChange({ ...config, replicaCount: Number(e.target.value) })}
                        disabled={disabled}
                        min={1}
                        max={10}
                    />
                </Field>
            )}
            <Field label="Max Connection Pool">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.maxConnectionPool}
                    onChange={(e) => onChange({ ...config, maxConnectionPool: Number(e.target.value) })}
                    disabled={disabled}
                    min={10}
                    step={10}
                />
            </Field>
            <Field label="Base Query Time (ms)">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.baseQueryTimeMs}
                    onChange={(e) => onChange({ ...config, baseQueryTimeMs: Number(e.target.value) })}
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
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.maxMemoryMb}
                    onChange={(e) => onChange({ ...config, maxMemoryMb: Number(e.target.value) })}
                    disabled={disabled}
                    min={64}
                    step={64}
                />
            </Field>
            <Field label="TTL (seconds)">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.ttlSeconds}
                    onChange={(e) => onChange({ ...config, ttlSeconds: Number(e.target.value) })}
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
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.maxOpsPerSecond}
                    onChange={(e) => onChange({ ...config, maxOpsPerSecond: Number(e.target.value) })}
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
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.maxQueueDepth}
                    onChange={(e) => onChange({ ...config, maxQueueDepth: Number(e.target.value) })}
                    disabled={disabled}
                    min={100}
                    step={100}
                />
            </Field>
            <Field label="Processing Rate/Sec">
                <input
                    type="number"
                    className={INPUT_CLASS}
                    value={config.processingRatePerSecond}
                    onChange={(e) => onChange({ ...config, processingRatePerSecond: Number(e.target.value) })}
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
                    <input
                        type="number"
                        className={INPUT_CLASS}
                        value={config.maxRetries}
                        onChange={(e) => onChange({ ...config, maxRetries: Number(e.target.value) })}
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
