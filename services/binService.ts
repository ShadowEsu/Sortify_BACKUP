
import { BinLocation, BinCategory } from '../types';

export const binService = {
  getNearbyBins: async (lat: number, lng: number, radius: number): Promise<BinLocation[]> => {
    // Generates mock bins in close proximity (walking distance ~200-500m)
    const mockBins = [
      {
        id: '1',
        name: 'Sector A Recycle Hub',
        lat: lat + 0.0015,
        lng: lng + 0.0008,
        type: BinCategory.RECYCLE,
      },
      {
        id: '2',
        name: 'Zone 7 Compost Post',
        lat: lat - 0.0008,
        lng: lng + 0.0021,
        type: BinCategory.COMPOST,
      },
      {
        id: '3',
        name: 'Public Waste Unit 04',
        lat: lat + 0.0022,
        lng: lng - 0.0015,
        type: BinCategory.WASTE,
      },
      {
        id: '4',
        name: 'High-Density Sort Point',
        lat: lat - 0.0012,
        lng: lng - 0.0007,
        type: BinCategory.RECYCLE,
      },
      {
        id: '5',
        name: 'Tactical Disposal Pod',
        lat: lat + 0.0005,
        lng: lng - 0.0011,
        type: BinCategory.WASTE,
      }
    ];

    return mockBins.map(bin => {
      // Haversine formula for actual km distance
      const R = 6371; // Earth radius in km
      const dLat = (bin.lat - lat) * Math.PI / 180;
      const dLng = (bin.lng - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(bin.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return {
        ...bin,
        distance
      };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }
};
