# System Design Simulator

> **Interactive system architecture simulator** — drag components onto a canvas, connect them, and watch how traffic flows through your design under load.

🌐 **Live Demo**: [system-design-sim.vercel.app](https://system-design-sim.vercel.app)

---

## What It Does

Build a distributed system visually and simulate thousands of requests flowing through it. See **exactly** where bottlenecks form, which components fail under load, and how configuration changes affect performance — all in real time.

### Components You Can Use

| Component | What It Simulates |
|---|---|
| 🔵 **Load Balancer** | Distributes traffic across downstream servers (round robin, least connections, random) |
| 🟣 **App Server** | Processes requests with configurable instances, CPU, memory, and concurrency limits |
| 🟠 **Database** | Persistent storage with SQL/NoSQL types, sharding, replication, and connection pooling |
| 🟢 **Cache** | In-memory layer with LRU/LFU/TTL eviction, hit rate tuning, and ops/sec limits |
| 🔴 **Message Queue** | Async processing with configurable queue depth, retry policies, and dead-letter queues |

### Health States During Simulation

Nodes glow in real time based on their load:

- 🟢 **Healthy** (< 70% capacity) — green glow
- 🟡 **Degraded** (70–90%) — yellow glow
- 🔴 **Critical** (90–100%) — red glow + pulse
- ⚫ **Failed** (> 100%) — dark red, requests are dropped

---

## How To Use

### 1. Build Your Architecture

- **Drag** components from the left sidebar onto the canvas
- **Connect** them by dragging from a node's right handle to another node's left handle
- **Configure** any node by clicking on it — the config panel opens on the right

### 2. Run a Simulation

- Set the **number of requests** in the bottom control bar (default: 10,000)
- Click **Start Simulation**
- Watch traffic flow through your system — nodes change color based on health

### 3. Analyze Results

After simulation completes, the **results panel** opens automatically showing:

- ✅ Total passed / failed requests
- 📊 Success rate
- 📈 Latency over time (area chart)
- 📈 Throughput over time (area chart)
- ⚠️ Detected issues (bottlenecks, failures)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Canvas | React Flow (`@xyflow/react`) |
| State | Zustand |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Getting Started

```bash
# Clone
git clone https://github.com/Asjad1007/system_design_sim.git
cd system_design_sim

# Install
npm install

# Run locally
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx              # React Flow canvas with drag-and-drop
│   ├── Sidebar.tsx             # Component palette (color-coded)
│   ├── ConfigPanel.tsx         # Node configuration forms
│   ├── SimulationControls.tsx  # Request count + start/reset
│   ├── MetricsPanel.tsx        # Post-simulation results & charts
│   └── nodes/
│       └── SimNodeComponent.tsx  # Custom node renderer with health states
├── engine/
│   ├── simulator.ts            # Simulation orchestrator (tick-based)
│   ├── processors.ts           # Per-component math models
│   └── graphUtils.ts           # Topological sort, entry node detection
├── store/
│   └── useSimStore.ts          # Zustand global state
├── types/
│   └── index.ts                # TypeScript interfaces & defaults
├── App.tsx                     # Layout shell
├── main.tsx                    # Entry point
└── index.css                   # Global styles & React Flow overrides
```

---

## How the Simulation Engine Works

1. **Graph Analysis** — Identifies entry nodes (no incoming edges) and performs topological sort
2. **Tick-Based Processing** — Each tick, traffic flows from entry nodes through the graph
3. **Per-Component Models** — Each component type has its own capacity/latency/failure math:
   - Load balancers cap at `maxConnectionsPerSecond`
   - App servers scale with `instances × maxConcurrentRequests`
   - Databases factor in sharding, replication, and connection pools
   - Caches use hit rate to split traffic between cache hits and DB misses
   - Message queues apply backpressure when queue depth is exceeded
4. **Health Computation** — Load ratio determines health state with thresholds at 70%/90%/100%
5. **Failure Detection** — Cascading failures, cache stampedes, and queue backpressure are detected and reported

---

