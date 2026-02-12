import type { Node, Edge } from '@xyflow/react';

// ─── Component Types ─────────────────────────────────────────
export type ComponentType = 'loadBalancer' | 'appServer' | 'database' | 'cache' | 'messageQueue';
export type HealthState = 'healthy' | 'degraded' | 'critical' | 'failed';

export interface ComponentMetrics {
    currentLoad: number;
    latencyMs: number;
    errorRate: number;
    throughput: number;
    queueDepth: number;
}

// ─── Config Interfaces ──────────────────────────────────────
export interface LoadBalancerConfig {
    algorithm: 'roundRobin' | 'leastConnections' | 'random';
    maxConnectionsPerSecond: number;
    healthCheckEnabled: boolean;
}

export interface AppServerConfig {
    instances: number;
    cpuCores: number;
    memoryMb: number;
    maxConcurrentRequests: number;
    processingTimeMs: number;
}

export interface DatabaseConfig {
    dbType: 'sql' | 'nosql';
    sharding: boolean;
    shardCount: number;
    replication: 'none' | 'sync' | 'async';
    replicaCount: number;
    readWriteProfile: 'readHeavy' | 'writeHeavy' | 'balanced';
    maxConnectionPool: number;
    baseQueryTimeMs: number;
}

export interface CacheConfig {
    strategy: 'lru' | 'lfu' | 'ttl';
    maxMemoryMb: number;
    ttlSeconds: number;
    hitRate: number;
    maxOpsPerSecond: number;
}

export interface MessageQueueConfig {
    maxQueueDepth: number;
    processingRatePerSecond: number;
    retryPolicy: 'none' | 'fixed' | 'exponentialBackoff';
    maxRetries: number;
    dlqEnabled: boolean;
}

export type NodeConfig =
    | LoadBalancerConfig
    | AppServerConfig
    | DatabaseConfig
    | CacheConfig
    | MessageQueueConfig;

// ─── Node Data ──────────────────────────────────────────────
export interface SimNodeData {
    componentType: ComponentType;
    label: string;
    config: NodeConfig;
    health: HealthState;
    metrics: ComponentMetrics;
    [key: string]: unknown;
}

export type SimNode = Node<SimNodeData>;
export type SimEdge = Edge;

// ─── Simulation Types ───────────────────────────────────────
export interface TickSnapshot {
    tick: number;
    nodes: Record<string, { health: HealthState; metrics: ComponentMetrics }>;
}

export interface SimulationResult {
    timeline: TickSnapshot[];
    totalRequests: number;
    totalPassed: number;
    totalFailed: number;
    durationTicks: number;
    detectedFailures: string[];
}

export type SimulationState = 'idle' | 'running' | 'complete';

// ─── Default Configs ────────────────────────────────────────
export const DEFAULT_CONFIGS: Record<ComponentType, NodeConfig> = {
    loadBalancer: {
        algorithm: 'roundRobin',
        maxConnectionsPerSecond: 5000,
        healthCheckEnabled: true,
    } as LoadBalancerConfig,
    appServer: {
        instances: 2,
        cpuCores: 4,
        memoryMb: 4096,
        maxConcurrentRequests: 200,
        processingTimeMs: 50,
    } as AppServerConfig,
    database: {
        dbType: 'sql',
        sharding: false,
        shardCount: 1,
        replication: 'none',
        replicaCount: 0,
        readWriteProfile: 'balanced',
        maxConnectionPool: 100,
        baseQueryTimeMs: 20,
    } as DatabaseConfig,
    cache: {
        strategy: 'lru',
        maxMemoryMb: 512,
        ttlSeconds: 300,
        hitRate: 0.8,
        maxOpsPerSecond: 10000,
    } as CacheConfig,
    messageQueue: {
        maxQueueDepth: 10000,
        processingRatePerSecond: 500,
        retryPolicy: 'exponentialBackoff',
        maxRetries: 3,
        dlqEnabled: true,
    } as MessageQueueConfig,
};

export const DEFAULT_METRICS: ComponentMetrics = {
    currentLoad: 0,
    latencyMs: 0,
    errorRate: 0,
    throughput: 0,
    queueDepth: 0,
};

export const COMPONENT_LABELS: Record<ComponentType, string> = {
    loadBalancer: 'Load Balancer',
    appServer: 'App Server',
    database: 'Database',
    cache: 'Cache',
    messageQueue: 'Message Queue',
};
