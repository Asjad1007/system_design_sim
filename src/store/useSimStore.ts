import { create } from 'zustand';
import {
    type SimNode,
    type SimEdge,
    type SimulationResult,
    type SimulationState,
    type ComponentType,
    type NodeConfig,
    DEFAULT_CONFIGS,
    DEFAULT_METRICS,
    COMPONENT_LABELS,
} from '../types';
import { runSimulation } from '../engine/simulator';

interface SimStore {
    nodes: SimNode[];
    edges: SimEdge[];
    selectedNodeId: string | null;
    simulationState: SimulationState;
    simulationResult: SimulationResult | null;
    currentTick: number;
    requestCount: number;

    setNodes: (nodes: SimNode[]) => void;
    setEdges: (edges: SimEdge[]) => void;
    addNode: (type: ComponentType, position: { x: number; y: number }) => void;
    removeNode: (id: string) => void;
    selectNode: (id: string | null) => void;
    updateNodeConfig: (id: string, config: NodeConfig) => void;
    setRequestCount: (count: number) => void;
    startSimulation: () => void;
    resetSimulation: () => void;
    setCurrentTick: (tick: number) => void;
}

let nodeCounter = 0;

export const useSimStore = create<SimStore>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    simulationState: 'idle',
    simulationResult: null,
    currentTick: 0,
    requestCount: 10000,

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    addNode: (type, position) => {
        const { nodes } = get();
        // Find all nodes of this type
        const existingNodes = nodes.filter((n) => n.data.componentType === type);

        // Extract all existing numbers from labels (e.g. "Load Balancer 1" -> 1)
        const usedNumbers = new Set(
            existingNodes.map((n) => {
                const match = n.data.label.match(/\d+$/);
                return match ? parseInt(match[0], 10) : 0;
            })
        );

        // Find the lowest available number starting from 1
        let counter = 1;
        while (usedNumbers.has(counter)) {
            counter++;
        }

        nodeCounter++; // Still use unique global ID suffix for safety/keys
        const id = `${type}-${Date.now()}-${nodeCounter}`;

        const newNode: SimNode = {
            id,
            type: 'simNode',
            position,
            data: {
                componentType: type,
                label: `${COMPONENT_LABELS[type]} ${counter}`,
                config: { ...DEFAULT_CONFIGS[type] },
                health: 'healthy',
                metrics: { ...DEFAULT_METRICS },
            },
        };
        set((state) => ({ nodes: [...state.nodes, newNode] }));
    },

    removeNode: (id) =>
        set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== id),
            edges: state.edges.filter((e) => e.source !== id && e.target !== id),
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        })),

    selectNode: (id) => set({ selectedNodeId: id }),

    updateNodeConfig: (id, config) =>
        set((state) => ({
            nodes: state.nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, config } } : n
            ),
        })),

    setRequestCount: (count) => set({ requestCount: count }),

    startSimulation: () => {
        const { nodes, edges, requestCount } = get();
        if (nodes.length === 0) return;

        set({ simulationState: 'running', currentTick: 0 });

        const result = runSimulation(nodes, edges, requestCount);

        const tickDuration = 30;
        let tick = 0;

        const interval = setInterval(() => {
            if (tick >= result.durationTicks) {
                clearInterval(interval);
                const lastSnapshot = result.timeline[result.timeline.length - 1];
                if (lastSnapshot) {
                    set((state) => ({
                        simulationState: 'complete',
                        currentTick: tick,
                        nodes: state.nodes.map((n) => {
                            const snap = lastSnapshot.nodes[n.id];
                            if (snap) {
                                return { ...n, data: { ...n.data, health: snap.health, metrics: snap.metrics } };
                            }
                            return n;
                        }),
                    }));
                } else {
                    set({ simulationState: 'complete' });
                }
                return;
            }

            const snapshot = result.timeline[tick];
            if (snapshot) {
                set((state) => ({
                    currentTick: tick,
                    nodes: state.nodes.map((n) => {
                        const snap = snapshot.nodes[n.id];
                        if (snap) {
                            return { ...n, data: { ...n.data, health: snap.health, metrics: snap.metrics } };
                        }
                        return n;
                    }),
                }));
            }
            tick++;
        }, tickDuration);

        set({ simulationResult: result });
    },

    resetSimulation: () =>
        set((state) => ({
            simulationState: 'idle',
            simulationResult: null,
            currentTick: 0,
            nodes: state.nodes.map((n) => ({
                ...n,
                data: { ...n.data, health: 'healthy' as const, metrics: { ...DEFAULT_METRICS } },
            })),
        })),

    setCurrentTick: (tick) => set({ currentTick: tick }),
}));
