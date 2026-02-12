import type { SimNode, SimEdge } from '../types';

/** Find nodes with no incoming edges — these are request entry points */
export function findEntryNodes(nodes: SimNode[], edges: SimEdge[]): SimNode[] {
    const nodesWithIncoming = new Set(edges.map((e) => e.target));
    return nodes.filter((n) => !nodesWithIncoming.has(n.id));
}

/** Topological sort via Kahn's algorithm */
export function topologicalSort(nodes: SimNode[], edges: SimEdge[]): SimNode[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();
    const nodeMap = new Map<string, SimNode>();

    for (const n of nodes) {
        inDegree.set(n.id, 0);
        adj.set(n.id, []);
        nodeMap.set(n.id, n);
    }

    for (const e of edges) {
        adj.get(e.source)?.push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree) {
        if (deg === 0) queue.push(id);
    }

    const sorted: SimNode[] = [];
    while (queue.length > 0) {
        const id = queue.shift()!;
        const node = nodeMap.get(id);
        if (node) sorted.push(node);

        for (const neighbor of adj.get(id) ?? []) {
            const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
            inDegree.set(neighbor, newDeg);
            if (newDeg === 0) queue.push(neighbor);
        }
    }

    return sorted;
}

/** Get downstream node IDs from a given node */
export function getDownstreamIds(nodeId: string, edges: SimEdge[]): string[] {
    return edges.filter((e) => e.source === nodeId).map((e) => e.target);
}
