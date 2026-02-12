import type {
    SimNodeData,
    ComponentMetrics,
    HealthState,
    LoadBalancerConfig,
    AppServerConfig,
    DatabaseConfig,
    CacheConfig,
    MessageQueueConfig,
} from '../types';

interface ProcessResult {
    passed: number;
    failed: number;
    latencyMs: number;
    outgoing: number;
}

/** Compute health state from load ratio */
function computeHealth(loadRatio: number): HealthState {
    if (loadRatio < 0.7) return 'healthy';
    if (loadRatio < 0.9) return 'degraded';
    if (loadRatio <= 1.0) return 'critical';
    return 'failed';
}

/** Process Load Balancer */
export function processLoadBalancer(
    config: LoadBalancerConfig,
    incomingRps: number,
    _metrics: ComponentMetrics,
): ProcessResult {
    const capacity = config.maxConnectionsPerSecond;
    const loadRatio = incomingRps / capacity;
    const passed = Math.min(incomingRps, capacity);
    const failed = Math.max(0, incomingRps - capacity);
    const latencyMs = 2 + Math.max(0, Math.log(Math.max(loadRatio, 0.01))) * 5;

    return { passed, failed, latencyMs: Math.max(0, latencyMs), outgoing: passed };
}

/** Process App Server */
export function processAppServer(
    config: AppServerConfig,
    incomingRps: number,
    _metrics: ComponentMetrics,
): ProcessResult {
    const capacity = config.instances * config.maxConcurrentRequests;
    const loadRatio = incomingRps / capacity;
    const passed = Math.min(incomingRps, capacity);
    const failed = Math.max(0, incomingRps - capacity);
    const latencyMs = config.processingTimeMs * (1 + loadRatio);

    return { passed, failed, latencyMs, outgoing: passed };
}

/** Process Database */
export function processDatabase(
    config: DatabaseConfig,
    incomingRps: number,
    _metrics: ComponentMetrics,
): ProcessResult {
    const effectivePool = config.maxConnectionPool * (config.sharding ? config.shardCount : 1);
    const replicaBoost = config.replication !== 'none'
        ? (config.readWriteProfile === 'readHeavy' ? 1 + config.replicaCount * 0.6 : 1 + config.replicaCount * 0.2)
        : 1;
    const capacity = effectivePool * replicaBoost;
    const loadRatio = incomingRps / capacity;
    const passed = Math.min(incomingRps, capacity);
    const failed = Math.max(0, incomingRps - capacity);
    // Quadratic degradation for databases
    const latencyMs = config.baseQueryTimeMs * (1 + loadRatio * loadRatio);
    // Sync replication adds latency
    const replicationPenalty = config.replication === 'sync' ? 10 * config.replicaCount : 0;

    return { passed, failed, latencyMs: latencyMs + replicationPenalty, outgoing: passed };
}

/** Process Cache — misses become outgoing to DB */
export function processCache(
    config: CacheConfig,
    incomingRps: number,
    _metrics: ComponentMetrics,
): ProcessResult {
    const capacity = config.maxOpsPerSecond;
    const loadRatio = incomingRps / capacity;
    const passed = Math.min(incomingRps, capacity);
    const failed = Math.max(0, incomingRps - capacity);
    const latencyMs = 1 + (loadRatio > 1 ? (loadRatio - 1) * 5 : 0);
    // Only cache misses go downstream
    const misses = passed * (1 - config.hitRate);

    return { passed, failed, latencyMs, outgoing: misses };
}

/** Process Message Queue */
export function processMessageQueue(
    config: MessageQueueConfig,
    incomingRps: number,
    metrics: ComponentMetrics,
): ProcessResult {
    const currentDepth = metrics.queueDepth + incomingRps;
    const processed = Math.min(currentDepth, config.processingRatePerSecond);
    const remainingDepth = currentDepth - processed;
    const overflow = Math.max(0, remainingDepth - config.maxQueueDepth);
    const failed = config.dlqEnabled ? 0 : overflow;
    const latencyMs = (remainingDepth / Math.max(config.processingRatePerSecond, 1)) * 1000;

    return { passed: processed, failed, latencyMs, outgoing: processed };
}

/** Dispatch to the correct processor based on component type */
export function processNode(
    data: SimNodeData,
    incomingRps: number,
): { result: ProcessResult; health: HealthState; metrics: ComponentMetrics } {
    let result: ProcessResult;

    switch (data.componentType) {
        case 'loadBalancer':
            result = processLoadBalancer(data.config as LoadBalancerConfig, incomingRps, data.metrics);
            break;
        case 'appServer':
            result = processAppServer(data.config as AppServerConfig, incomingRps, data.metrics);
            break;
        case 'database':
            result = processDatabase(data.config as DatabaseConfig, incomingRps, data.metrics);
            break;
        case 'cache':
            result = processCache(data.config as CacheConfig, incomingRps, data.metrics);
            break;
        case 'messageQueue':
            result = processMessageQueue(data.config as MessageQueueConfig, incomingRps, data.metrics);
            break;
    }

    const capacity = getCapacity(data);
    const loadRatio = incomingRps / Math.max(capacity, 1);
    const health = computeHealth(loadRatio);

    const metrics: ComponentMetrics = {
        currentLoad: incomingRps,
        latencyMs: result.latencyMs,
        errorRate: incomingRps > 0 ? result.failed / incomingRps : 0,
        throughput: result.passed,
        queueDepth: data.componentType === 'messageQueue'
            ? Math.max(0, (data.metrics.queueDepth + incomingRps) - result.passed)
            : 0,
    };

    return { result, health, metrics };
}

/** Get effective capacity for a node */
function getCapacity(data: SimNodeData): number {
    switch (data.componentType) {
        case 'loadBalancer':
            return (data.config as LoadBalancerConfig).maxConnectionsPerSecond;
        case 'appServer': {
            const c = data.config as AppServerConfig;
            return c.instances * c.maxConcurrentRequests;
        }
        case 'database': {
            const c = data.config as DatabaseConfig;
            const pool = c.maxConnectionPool * (c.sharding ? c.shardCount : 1);
            const replicaBoost = c.replication !== 'none'
                ? (c.readWriteProfile === 'readHeavy' ? 1 + c.replicaCount * 0.6 : 1 + c.replicaCount * 0.2)
                : 1;
            return pool * replicaBoost;
        }
        case 'cache':
            return (data.config as CacheConfig).maxOpsPerSecond;
        case 'messageQueue':
            return (data.config as MessageQueueConfig).processingRatePerSecond;
    }
}
