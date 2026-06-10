class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift().item;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

/**
 * Smart Indoor Airport Navigation Service
 * Represents the airport as a weighted undirected graph.
 * Uses Dijkstra's algorithm to find the shortest path between any two points.
 */

// Define the airport layout as an adjacency list
// Weights represent walking distance in meters (approx)
const airportGraph = {
  'Entrance': { 'Check-in A': 50, 'Check-in B': 60 },
  
  'Check-in A': { 'Entrance': 50, 'Security A': 40, 'Terminal A Info': 30 },
  'Check-in B': { 'Entrance': 60, 'Security B': 45, 'Terminal B Info': 35 },
  
  'Terminal A Info': { 'Check-in A': 30, 'Café Aroma': 20 },
  'Terminal B Info': { 'Check-in B': 35, 'Medical Clinic': 25 },
  
  'Security A': { 'Check-in A': 40, 'Terminal A Plaza': 30 },
  'Security B': { 'Check-in B': 45, 'Terminal B Plaza': 35 },
  
  'Terminal A Plaza': { 'Security A': 30, 'Gate A1': 40, 'Gate A2': 60, 'Pearl Lounge': 25, 'Café Aroma': 15 },
  'Terminal B Plaza': { 'Security B': 35, 'Gate B1': 50, 'Gate B2': 70, 'Gate B14': 100, 'Sky Lounge': 30, 'Spice Garden': 20, 'World of Fashion': 40 },
  
  // Terminal A Gates
  'Gate A1': { 'Terminal A Plaza': 40, 'Gate A2': 30 },
  'Gate A2': { 'Terminal A Plaza': 60, 'Gate A1': 30, 'Transfer Corridor': 80 },
  
  // Terminal B Gates
  'Gate B1': { 'Terminal B Plaza': 50, 'Gate B2': 35 },
  'Gate B2': { 'Terminal B Plaza': 70, 'Gate B1': 35, 'Gate B14': 60, 'Transfer Corridor': 90 },
  'Gate B14': { 'Terminal B Plaza': 100, 'Gate B2': 60, 'Prayer Room': 10 },
  
  // Amenities
  'Pearl Lounge': { 'Terminal A Plaza': 25 },
  'Sky Lounge': { 'Terminal B Plaza': 30 },
  'Café Aroma': { 'Terminal A Info': 20, 'Terminal A Plaza': 15 },
  'Spice Garden': { 'Terminal B Plaza': 20 },
  'Medical Clinic': { 'Terminal B Info': 25 },
  'World of Fashion': { 'Terminal B Plaza': 40 },
  'Prayer Room': { 'Gate B14': 10 },
  
  // Inter-terminal connection
  'Transfer Corridor': { 'Gate A2': 80, 'Gate B2': 90, 'Metro Station Connect': 120 },
  'Metro Station Connect': { 'Transfer Corridor': 120 }
};

// Simple descriptions for nodes to provide better directions
const nodeDescriptions = {
  'Entrance': 'Main Airport Entrance',
  'Check-in A': 'Domestic Check-in Counters (Terminal A)',
  'Check-in B': 'International Check-in Counters (Terminal B)',
  'Security A': 'Security Checkpoint A',
  'Security B': 'Security Checkpoint B',
  'Terminal A Plaza': 'Terminal A Main Concourse',
  'Terminal B Plaza': 'Terminal B Duty-Free Area',
  'Transfer Corridor': 'Connecting Walkway between Terminals'
};

/**
 * Get all available nodes in the navigation graph
 * @returns {Array} List of node names
 */
const getNavigableNodes = () => {
  return Object.keys(airportGraph).sort();
};

/**
 * Calculate the shortest path using Dijkstra's Algorithm
 * @param {string} startNode 
 * @param {string} endNode 
 * @returns {Object} { path, distance, directions }
 */
const findShortestPath = (startNode, endNode) => {
  if (!airportGraph[startNode] || !airportGraph[endNode]) {
    throw new Error('Invalid start or end location.');
  }

  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();

  // Initialization
  for (let node in airportGraph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  
  distances[startNode] = 0;
  pq.enqueue(startNode, 0);

  // Dijkstra's core loop
  while (!pq.isEmpty()) {
    const currentNode = pq.dequeue();

    if (currentNode === endNode) break;

    const neighbors = airportGraph[currentNode];
    for (let neighbor in neighbors) {
      const distanceToNeighbor = neighbors[neighbor];
      const totalDistance = distances[currentNode] + distanceToNeighbor;

      if (totalDistance < distances[neighbor]) {
        distances[neighbor] = totalDistance;
        previous[neighbor] = currentNode;
        pq.enqueue(neighbor, totalDistance);
      }
    }
  }

  // Path reconstruction
  if (distances[endNode] === Infinity) {
    throw new Error('No path found between these locations.');
  }

  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // Generate human-readable directions
  const directions = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const dist = airportGraph[from][to];
    
    // Friendly naming
    const friendlyFrom = nodeDescriptions[from] || from;
    const friendlyTo = nodeDescriptions[to] || to;
    
    if (i === 0) {
      directions.push(`Start at ${friendlyFrom}.`);
    }
    
    directions.push(`Walk ${dist}m towards ${friendlyTo}.`);
    
    if (i === path.length - 2) {
      directions.push(`You have arrived at ${friendlyTo}.`);
    }
  }

  // Assuming average walking speed of 1.4 meters per second (84m/min)
  const walkingTimeMinutes = Math.ceil(distances[endNode] / 84);

  return {
    path,
    distance: distances[endNode],
    estimatedTimeMinutes: walkingTimeMinutes,
    directions
  };
};

module.exports = {
  airportGraph,
  getNavigableNodes,
  findShortestPath
};
