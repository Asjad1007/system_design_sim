import { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type Connection,
    type NodeChange,
    type EdgeChange,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSimStore } from '../store/useSimStore';
import SimNodeComponent from './nodes/SimNodeComponent';
import type { ComponentType, SimNodeData, SimNode } from '../types';

const nodeTypes = {
    simNode: SimNodeComponent,
};

function CanvasContent() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();
    const nodes = useSimStore((s) => s.nodes);
    const edges = useSimStore((s) => s.edges);
    const setNodes = useSimStore((s) => s.setNodes);
    const setEdges = useSimStore((s) => s.setEdges);
    const addNode = useSimStore((s) => s.addNode);
    const selectNode = useSimStore((s) => s.selectNode);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes(applyNodeChanges(changes, nodes) as SimNode[]);
        },
        [nodes, setNodes]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges(applyEdgeChanges(changes, edges));
        },
        [edges, setEdges]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges(
                addEdge(
                    {
                        ...connection,
                        animated: true,
                        style: { stroke: '#6366f1', strokeWidth: 2 },
                    },
                    edges
                )
            );
        },
        [edges, setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/component-type') as ComponentType;
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            addNode(type, position);
        },
        [addNode, screenToFlowPosition]
    );

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: SimNode) => {
            selectNode(node.id);
        },
        [selectNode]
    );

    const onPaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    return (
        <div ref={reactFlowWrapper} className="flex-1 h-full">
            <ReactFlow
                nodes={nodes as any}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2 },
                }}
            >
                <Background
                    variant={BackgroundVariant.Cross}
                    gap={24}
                    size={2}
                    color="#cbd5e1"
                />
                <Controls
                    className="!bg-white !border-slate-200 !rounded-xl !shadow-lg [&>button]:!bg-white [&>button]:!border-slate-200 [&>button]:!text-slate-600 [&>button:hover]:!bg-slate-50"
                />
                <MiniMap
                    nodeColor={(n) => {
                        const health = (n.data as SimNodeData)?.health;
                        switch (health) {
                            case 'healthy': return '#22c55e';
                            case 'degraded': return '#eab308';
                            case 'critical': return '#ef4444';
                            case 'failed': return '#991b1b';
                            default: return '#6366f1';
                        }
                    }}
                    className="!bg-white !border-slate-200 !rounded-xl !shadow-sm"
                    maskColor="rgba(241, 245, 249, 0.6)"
                />
            </ReactFlow>
        </div>
    );
}

export default function Canvas() {
    return (
        <ReactFlowProvider>
            <CanvasContent />
        </ReactFlowProvider>
    );
}
