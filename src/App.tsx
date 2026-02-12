import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ConfigPanel from './components/ConfigPanel';
import SimulationControls from './components/SimulationControls';
import MetricsPanel from './components/MetricsPanel';
import { Cpu } from 'lucide-react';

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <header className="h-12 bg-white/60 backdrop-blur-xl border-b border-slate-200 flex items-center px-4 gap-3 shrink-0 relative z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
            <Cpu size={16} className="text-accent" />
          </div>
          <h1 className="text-sm font-semibold text-slate-800 tracking-tight">
            System Design Simulator
          </h1>
        </div>
        <div className="w-px h-5 bg-slate-200" />
        <p className="text-xs text-slate-500">
          Drag components • Connect nodes • Run simulation
        </p>
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
    </div>
  );
}
