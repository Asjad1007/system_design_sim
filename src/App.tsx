import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ConfigPanel from './components/ConfigPanel';
import SimulationControls from './components/SimulationControls';
import MetricsPanel from './components/MetricsPanel';
import BuilderBadge from './components/BuilderBadge';
import { Cpu } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col bg-slate-100">
      {/* Top Bar — clean white with indigo accent line */}
      <header className="h-12 bg-white flex items-center px-5 gap-3 shrink-0 relative z-50 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-accent text-white">
            <Cpu size={15} />
          </div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">
            System Design Simulator
          </h1>
        </div>
        <div className="flex-1" />
        <BuilderBadge />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 relative">
          <Canvas />
          <SimulationControls />
          <MetricsPanel />
        </div>
        <ConfigPanel />
      </div>
      <Analytics />
    </div>
  );
}
