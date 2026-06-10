// Rich graphical airport map SVG - shared by Navigation and Crowd Density pages
export const MAP_COORDS = {
  'Entrance': { x: 50, y: 6 },
  'Check-in A': { x: 23, y: 20 }, 'Check-in B': { x: 77, y: 20 },
  'Terminal A Info': { x: 12, y: 30 }, 'Terminal B Info': { x: 88, y: 30 },
  'Security A': { x: 23, y: 40 }, 'Security B': { x: 77, y: 40 },
  'Café Aroma': { x: 13, y: 47 }, 'Medical Clinic': { x: 87, y: 47 },
  'Terminal A Plaza': { x: 23, y: 60 }, 'Terminal B Plaza': { x: 77, y: 60 },
  'Pearl Lounge': { x: 10, y: 68 }, 'Sky Lounge': { x: 90, y: 68 },
  'Spice Garden': { x: 64, y: 65 }, 'World of Fashion': { x: 87, y: 57 },
  'Gate A1': { x: 11, y: 82 }, 'Gate A2': { x: 35, y: 82 },
  'Gate B1': { x: 65, y: 82 }, 'Gate B2': { x: 89, y: 82 },
  'Gate B14': { x: 89, y: 97 }, 'Prayer Room': { x: 76, y: 97 },
  'Transfer Corridor': { x: 50, y: 78 }, 'Food Court': { x: 50, y: 63 },
  'Metro Station Connect': { x: 50, y: 92 },
};

const DENSITY_PALETTE = {
  Low: '#10b981',
  Moderate: '#f59e0b',
  High: '#f97316',
  Critical: '#e11d48',
};

const EDGES = [
  ['Entrance', 'Check-in A'], ['Entrance', 'Check-in B'],
  ['Check-in A', 'Security A'], ['Check-in A', 'Terminal A Info'],
  ['Check-in B', 'Security B'], ['Check-in B', 'Terminal B Info'],
  ['Terminal A Info', 'Café Aroma'], ['Terminal B Info', 'Medical Clinic'],
  ['Security A', 'Terminal A Plaza'], ['Security B', 'Terminal B Plaza'],
  ['Terminal A Plaza', 'Gate A1'], ['Terminal A Plaza', 'Gate A2'],
  ['Terminal A Plaza', 'Pearl Lounge'], ['Terminal A Plaza', 'Café Aroma'],
  ['Terminal B Plaza', 'Gate B1'], ['Terminal B Plaza', 'Gate B2'], ['Terminal B Plaza', 'Gate B14'],
  ['Terminal B Plaza', 'Sky Lounge'], ['Terminal B Plaza', 'Spice Garden'],
  ['Terminal B Plaza', 'World of Fashion'],
  ['Gate A1', 'Gate A2'], ['Gate B1', 'Gate B2'],
  ['Gate A2', 'Transfer Corridor'], ['Gate B2', 'Transfer Corridor'],
  ['Transfer Corridor', 'Food Court'], ['Transfer Corridor', 'Metro Station Connect'],
  ['Gate B2', 'Gate B14'], ['Gate B14', 'Prayer Room'],
];

export default function AirportMapSVG({ route = null, densityZones = null }) {
  const pathNodes = route?.path || [];

  // Build a set of edges that are on the path
  const pathEdgeSet = new Set();
  for (let i = 0; i < pathNodes.length - 1; i++) {
    pathEdgeSet.add(`${pathNodes[i]}_${pathNodes[i + 1]}`);
    pathEdgeSet.add(`${pathNodes[i + 1]}_${pathNodes[i]}`);
  }

  const getDensity = (name) => densityZones?.find(z => z.zone === name);

  return (
    <svg
      viewBox="0 0 100 104"
      className="w-full h-full drop-shadow-sm select-none"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Airport background */}
      <rect x="0" y="0" width="100" height="104" fill="#f8fafc" rx="2" />

      {/* Terminal A building */}
      <rect x="2" y="12" width="42" height="86" rx="2" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.5" />
      <text x="23" y="10" fontSize="3" fill="#3b82f6" textAnchor="middle" fontWeight="800">TERMINAL A</text>
      <text x="23" y="13.5" fontSize="1.8" fill="#93c5fd" textAnchor="middle">Domestic</text>

      {/* Terminal B building */}
      <rect x="56" y="12" width="42" height="90" rx="2" fill="#fdf4ff" stroke="#e9d5ff" strokeWidth="0.5" />
      <text x="77" y="10" fontSize="3" fill="#9333ea" textAnchor="middle" fontWeight="800">TERMINAL B</text>
      <text x="77" y="13.5" fontSize="1.8" fill="#c4b5fd" textAnchor="middle">International</text>

      {/* Connector zone */}
      <rect x="42" y="55" width="16" height="35" rx="1" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.4" />
      <text x="50" y="70" fontSize="1.8" fill="#16a34a" textAnchor="middle" fontWeight="700">TRANSIT</text>
      <text x="50" y="73" fontSize="1.5" fill="#86efac" textAnchor="middle">ZONE</text>

      {/* Entrance area */}
      <rect x="38" y="1" width="24" height="8" rx="1.5" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="0.4" />
      <text x="50" y="5.5" fontSize="2" fill="#0284c7" textAnchor="middle" fontWeight="700">ENTRANCE</text>

      {/* Gate areas – Terminal A */}
      <rect x="3" y="78" width="19" height="16" rx="1" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.3" />
      <rect x="26" y="78" width="18" height="16" rx="1" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.3" />

      {/* Gate areas – Terminal B */}
      <rect x="57" y="78" width="17" height="16" rx="1" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="0.3" />
      <rect x="77" y="78" width="20" height="16" rx="1" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="0.3" />
      <rect x="77" y="93" width="20" height="10" rx="1" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="0.3" />

      {/* Draw all edges */}
      {EDGES.map(([a, b]) => {
        const ca = MAP_COORDS[a];
        const cb = MAP_COORDS[b];
        if (!ca || !cb) return null;
        const isPath = pathEdgeSet.has(`${a}_${b}`);
        return (
          <line
            key={`${a}-${b}`}
            x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
            stroke={isPath ? '#4f46e5' : '#cbd5e1'}
            strokeWidth={isPath ? '1.2' : '0.4'}
            strokeLinecap="round"
            strokeDasharray={isPath ? '2,1.5' : 'none'}
            opacity={isPath ? 1 : 0.6}
          />
        );
      })}

      {/* Draw nodes */}
      {Object.entries(MAP_COORDS).map(([name, pos]) => {
        const isStart = pathNodes[0] === name;
        const isEnd = pathNodes[pathNodes.length - 1] === name;
        const isOnPath = pathNodes.includes(name);
        const density = getDensity(name);
        const dColor = density ? DENSITY_PALETTE[density.category] : null;

        const nodeRadius = isStart || isEnd ? 2.8 : isOnPath ? 2.2 : 1.8;
        const nodeFill = isStart
          ? '#10b981'
          : isEnd
          ? '#ef4444'
          : isOnPath
          ? '#4f46e5'
          : dColor || '#94a3b8';

        return (
          <g key={name} transform={`translate(${pos.x},${pos.y})`}>
            {/* Density halo */}
            {dColor && (
              <circle r="5" fill={dColor} opacity="0.18" className="animate-pulse" />
            )}
            {/* Main node */}
            <circle
              r={nodeRadius}
              fill={nodeFill}
              stroke="#fff"
              strokeWidth={isStart || isEnd ? 0.8 : 0.5}
              opacity="0.95"
            />
            {/* Inner dot for start/end */}
            {(isStart || isEnd) && <circle r="1" fill="#fff" />}

            {/* Node label */}
            <text
              y={isStart || isEnd ? -3.5 : -2.8}
              fontSize={isStart || isEnd ? 2 : 1.7}
              fill={isStart ? '#059669' : isEnd ? '#dc2626' : isOnPath ? '#3730a3' : '#475569'}
              fontWeight={isOnPath || isStart || isEnd ? 'bold' : 'normal'}
              textAnchor="middle"
            >
              {name}
            </text>

            {/* Density % label */}
            {density && (
              <text y="3.5" fontSize="1.6" fill={dColor} fontWeight="bold" textAnchor="middle">
                {density.densityLevel}%
              </text>
            )}
          </g>
        );
      })}

      {/* Density legend */}
      {densityZones && (
        <g transform="translate(1, 97)">
          {[['Low', '#10b981'], ['Moderate', '#f59e0b'], ['High', '#f97316'], ['Critical', '#e11d48']].map(([lbl, col], i) => (
            <g key={lbl} transform={`translate(${i * 24}, 0)`}>
              <circle cx="3" cy="2.5" r="2" fill={col} opacity="0.8" />
              <text x="6.5" y="4" fontSize="1.8" fill="#64748b">{lbl}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
