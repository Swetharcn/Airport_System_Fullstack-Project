const CrowdDensity = require('../models/CrowdDensity');

/**
 * Smart Crowd Density Service
 * Simulates crowd movement and generates heatmap data.
 * In a production environment, this would ingest data from IoT cameras or WiFi access points.
 */

// Defines the base capacity and normal crowd multiplier for different zones
const AIRPORT_ZONES = [
  { zone: 'Entrance', terminal: 'Common Area', capacity: 1000 },
  { zone: 'Check-in A', terminal: 'Terminal A', capacity: 400 },
  { zone: 'Check-in B', terminal: 'Terminal B', capacity: 500 },
  { zone: 'Security A', terminal: 'Terminal A', capacity: 300 },
  { zone: 'Security B', terminal: 'Terminal B', capacity: 350 },
  { zone: 'Terminal A Plaza', terminal: 'Terminal A', capacity: 800 },
  { zone: 'Terminal B Plaza', terminal: 'Terminal B', capacity: 1200 },
  { zone: 'Gate A1', terminal: 'Terminal A', capacity: 150 },
  { zone: 'Gate A2', terminal: 'Terminal A', capacity: 150 },
  { zone: 'Gate B1', terminal: 'Terminal B', capacity: 200 },
  { zone: 'Gate B2', terminal: 'Terminal B', capacity: 200 },
  { zone: 'Gate B14', terminal: 'Terminal B', capacity: 250 },
  { zone: 'Food Court', terminal: 'Common Area', capacity: 400 },
  { zone: 'Transfer Corridor', terminal: 'Common Area', capacity: 300 }
];

// Base coordinates for the frontend heatmap SVG rendering
const ZONE_COORDINATES = {
  'Entrance': { x: 50, y: 10 },
  'Check-in A': { x: 20, y: 30 },
  'Check-in B': { x: 80, y: 30 },
  'Security A': { x: 20, y: 50 },
  'Security B': { x: 80, y: 50 },
  'Terminal A Plaza': { x: 20, y: 70 },
  'Terminal B Plaza': { x: 80, y: 70 },
  'Gate A1': { x: 10, y: 90 },
  'Gate A2': { x: 30, y: 90 },
  'Gate B1': { x: 70, y: 90 },
  'Gate B2': { x: 90, y: 90 },
  'Gate B14': { x: 90, y: 110 },
  'Food Court': { x: 50, y: 70 },
  'Transfer Corridor': { x: 50, y: 85 }
};

/**
 * Initialize zones in DB if they don't exist
 */
const initializeZones = async () => {
  try {
    for (const z of AIRPORT_ZONES) {
      const exists = await CrowdDensity.findOne({ zone: z.zone });
      if (!exists) {
        await CrowdDensity.create({
          zone: z.zone,
          terminal: z.terminal,
          capacity: z.capacity,
          coordinates: ZONE_COORDINATES[z.zone] || { x: 0, y: 0 }
        });
      }
    }
    console.log('✅ Crowd density zones initialized');
  } catch (error) {
    console.error('Failed to initialize crowd zones:', error);
  }
};

/**
 * Simulate crowd movement based on time of day
 * Updates the DB with new randomized (but realistic) density levels
 */
const updateSimulation = async () => {
  try {
    const zones = await CrowdDensity.find();
    
    // Simulate peak hours (e.g., 8-10 AM, 5-7 PM)
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    const baseMultiplier = isPeakHour ? 0.7 : 0.3; // 70% full during peak, 30% otherwise

    const updates = zones.map(async (zone) => {
      // Add random fluctuation (-15% to +25%)
      const fluctuation = (Math.random() * 0.4) - 0.15;
      
      // Some zones like security are prone to sudden spikes
      const isBottleneck = zone.zone.includes('Security') || zone.zone.includes('Check-in');
      const bottleneckFactor = isBottleneck && Math.random() > 0.8 ? 0.3 : 0; 
      
      let newDensityLevel = Math.floor((baseMultiplier + fluctuation + bottleneckFactor) * 100);
      
      // Clamp between 5 and 100
      newDensityLevel = Math.max(5, Math.min(100, newDensityLevel));
      
      // Calculate human count based on capacity
      const currentCount = Math.floor((newDensityLevel / 100) * zone.capacity);

      zone.densityLevel = newDensityLevel;
      zone.currentCount = currentCount;
      zone.lastUpdated = new Date();
      zone.updateCategory(); // sets 'Low', 'High', etc based on percentage
      
      return zone.save();
    });

    await Promise.all(updates);
  } catch (error) {
    console.error('Crowd simulation update failed:', error);
  }
};

/**
 * Get alternative route suggestion to avoid crowd
 * Very basic heuristic: just suggest an alternative security checkpoint or check-in if congested
 */
const getAlternativeSuggestion = async (zoneName) => {
  const zone = await CrowdDensity.findOne({ zone: zoneName });
  if (!zone || zone.densityLevel < 70) return null; // No alternative needed if not crowded

  let alternative = null;

  if (zoneName === 'Security A') {
    alternative = await CrowdDensity.findOne({ zone: 'Security B' });
  } else if (zoneName === 'Security B') {
    alternative = await CrowdDensity.findOne({ zone: 'Security A' });
  } else if (zoneName === 'Check-in A') {
    alternative = await CrowdDensity.findOne({ zone: 'Check-in B' }); // Usually strictly assigned, but for demo
  }

  if (alternative && alternative.densityLevel < zone.densityLevel - 20) {
    return {
      message: `${zoneName} is currently highly congested. Consider using ${alternative.zone} which is less crowded.`,
      alternativeZone: alternative.zone,
      savedDensity: zone.densityLevel - alternative.densityLevel
    };
  }

  return null;
};

module.exports = {
  initializeZones,
  updateSimulation,
  getAlternativeSuggestion
};
