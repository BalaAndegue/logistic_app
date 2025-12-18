// models/driver.model.ts

// Interface pour la création (sans id)
export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType: 'bike' | 'scooter' | 'car' | 'van';
  licensePlate?: string;
}

// Interface complète (avec id obligatoire)
export interface Driver extends CreateDriverDto {
  id: number;  // ✅ ID obligatoire
  isAvailable: boolean;
  currentPosition?: {
    latitude: number;
    longitude: number;
  };
  activeDeliveries: number;
  totalDeliveries: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}