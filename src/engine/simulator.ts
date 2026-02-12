import type {
    SimNode,
    SimEdge,
    TickSnapshot,
    SimulationResult,
    SimNodeData,
} from '../types';
import { findEntryNodes, topologicalSort, getDownstreamIds } from './graphUtils';
import { processNode } from './processors';

const EMPTY_METRICS = {
    currentLoad: 0,
    latencyMs: 0,
    errorRate: 0,
    throughput: 0,
    queueDepth: 0,
};

export function runSimulation(
    nodes: SimNode[],
    edges: SimEdge[],
    totalRequests: number,
    durationSec: number = 10,
): SimulationResult {
    const tickCount = durationSec * 10;
    const requestsPerTick = totalRequests / tickCount;
    const timeline: TickSnapshot[] = [];

    const workingData = new Map<string, SimNodeData>();
    for (const node of nodes) {
        workingData.set(node.id, {
            ...node.data,
            health: 'healthy',
            metrics: { ...EMPTY_METRICS },
        });
    }

    const pending = new Map<string, number>();
    let globalPassed = 0;
    let globalFailed = 0;
    const failureEvents = new Set<string>();

    const entryNodes = findEntryNodes(nodes, edges);
    const sortedNodes = topologicalSort(nodes, edges);

    for (let tick = 0; tick < tickCount; tick++) {
        for (const node of nodes) {
            pending.set(node.id, 0);
        }

        for (const entry of entryNodes) {
            pending.set(entry.id, (pending.get(entry.id) ?? 0) + requestsPerTick);
        }

        for (const node of sortedNodes) {
            const data = workingData.get(node.id)!;
            const incomingRps = pending.get(node.id) ?? 0;

            if (data.health === 'failed') {
                globalFailed += incomingRps;
                failureEvents.add(
                    `Cascading Failure: ${data.label} is down, blocking ${Math.round(incomingRps)} req/tick`
                );
                continue;
            }

            const { result, health, metrics } = processNode(data, incomingRps);

            data.health = health;
            data.metrics = metrics;
            workingData.set(node.id, data);

            globalPassed += result.passed;
            globalFailed += result.failed;

            const downstreamIds = getDownstreamIds(node.id, edges);
            if (downstreamIds.length > 0) {
                const perDownstream = result.outgoing / downstreamIds.length;
                for (const dsId of downstreamIds) {
                    pending.set(dsId, (pending.get(dsId) ?? 0) + perDownstream);
                }
            }

            if (health === 'failed') {
                failureEvents.add(`Node Failure: ${data.label} exceeded capacity`);
            }
            if (health === 'critical' && data.componentType === 'database') {
                failureEvents.add(`Database Bottleneck: ${data.label} at critical load`);
            }

            if (data.componentType === 'cache') {
                const cacheConfig = data.config as { hitRate: number };
                if (cacheConfig.hitRate < 0.3) {
                    failureEvents.add(
                        `Cache Stampede risk: ${data.label} hit rate is only ${(cacheConfig.hitRate * 100).toFixed(0)}%`
                    );
                }
            }

            if (data.componentType === 'messageQueue' && metrics.queueDepth > 0) {
                const mqConfig = data.config as { maxQueueDepth: number; dlqEnabled: boolean };
                if (metrics.queueDepth > mqConfig.maxQueueDepth * 0.9) {
                    failureEvents.add(
                        mqConfig.dlqEnabled
                            ? `Queue Backpressure: ${data.label} near capacity (DLQ active)`
                            : `Queue Overflow: ${data.label} dropping messages!`
                    );
                }
            }
        }

        const snapshot: TickSnapshot = { tick, nodes: {} };
        for (const [id, data] of workingData) {
            snapshot.nodes[id] = {
                health: data.health,
                metrics: { ...data.metrics },
            };
        }
        timeline.push(snapshot);
    }

    return {
        timeline,
        totalRequests,
        totalPassed: Math.round(globalPassed),
        totalFailed: Math.round(globalFailed),
        durationTicks: tickCount,
        detectedFailures: Array.from(failureEvents),
    };
}
