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
      <header className="h-11 bg-white border-b border-slate-200/80 flex items-center px-4 gap-2.5 shrink-0 relative z-50">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-accent/10">
            <Cpu size={14} className="text-accent" />
          </div>
          <h1 className="text-[13px] font-semibold text-slate-800 tracking-tight">
            System Design Simulator
          </h1>
        </div>
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
