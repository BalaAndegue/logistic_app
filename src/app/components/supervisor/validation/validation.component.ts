import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorMockService } from '../../../services/supervisor-mock.service';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnInit {
  pendingDeliveries: any[] = [];
  selectedDelivery: any = null;
  loading = true;

  constructor(private supervisorService: SupervisorMockService) {}

  ngOnInit(): void {
    this.loadPendingValidations();
  }

  loadPendingValidations() {
    // In a real scenario, this calls your Laravel API
    this.pendingDeliveries = [
      {
        id: 'DEL-1024',
        driver: 'Jean D.',
        client: 'Pharmacie du Centre',
        time: '14:20',
        proofs: {
          signature: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png',
          photo: 'https://images.unsplash.com/photo-1586769852044-692d6e39241c?auto=format&fit=crop&q=80&w=400',
          qrCode: 'Scanned Successfully'
        }
      },
      {
        id: 'DEL-1025',
        driver: 'Marie K.',
        client: 'Supermarché Express',
        time: '15:45',
        proofs: {
          signature: null, // Test case for missing info
          photo: 'https://images.unsplash.com/photo-1530124560676-40bc94ec2105?auto=format&fit=crop&q=80&w=400',
          qrCode: 'Manual Entry'
        }
      }
    ];
    this.loading = false;
  }

  selectDelivery(delivery: any) {
    this.selectedDelivery = delivery;
  }

  validateDelivery(id: string) {
    // Logic to call backend validation
    console.log(`Validating delivery ${id}...`);
    this.pendingDeliveries = this.pendingDeliveries.filter(d => d.id !== id);
    this.selectedDelivery = null;
    alert('Delivery validated successfully!');
  }
}