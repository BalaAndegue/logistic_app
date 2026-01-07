// models/vehicle.model.ts
export interface Vehicle {
  id: number;
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  type: 'truck' | 'van' | 'motorcycle' | 'car';
  status: 'available' | 'on_route' | 'delivering' | 'returning' | 'maintenance';
  currentLocation: {
    lat: number;
    lng: number;
    timestamp: string;
    address?: string;
  };
  speed: number;
  battery?: number | null;  // <-- Accepter null
  temperature?: number | null;  // <-- Accepter null
  lastUpdate: string;
  route?: {
    origin: string;
    destination: string;
    estimatedArrival: string;
    distanceRemaining: number;
  };
}

export interface VehicleStatus {
  vehicleId: string | number;
  status: Vehicle['status'];
  location: Vehicle['currentLocation'];
  timestamp: string;
  additionalData?: {
    speed?: number;
    battery?: number | null;  // <-- Accepter null
    temperature?: number | null;  // <-- Accepter null
    [key: string]: any;
  };
}