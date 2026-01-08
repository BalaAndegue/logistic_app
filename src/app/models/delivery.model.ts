export interface Delivery {
  id: string;
  reference: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postalCode: string;
  status: DeliveryStatus;
  driverId: string | null;
  assignedAt: string | null;
  estimatedDelivery: string;
  actualDelivery: string | null;
  proofUrl?: string;
  signatureUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus = 
  | 'pending'      // En attente
  | 'assigned'     // Assigné
  | 'in_transit'   // En cours
  | 'delivered'    // Livré
  | 'failed'       // Échoué
  | 'cancelled';   // Annulé

export interface Driver {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  licensePlate: string;
  status: 'active' | 'inactive' | 'on_delivery';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}