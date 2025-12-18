import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  processing = false;

  private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';
  private token = '89|keKVIHu4YwfLJcsrFQkS9Cbzbo6KCBcnzODtbeHef9616b04';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPendingDeliveries();
  }

  getHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
  }

  fetchPendingDeliveries(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/deliveries/pending`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        this.pendingDeliveries = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
      }
    });
  }

  onSelectDelivery(delivery: any): void {
    this.selectedDelivery = delivery;
  }

  // Implementation of the Status Update logic
  updateDeliveryStatus(status: 'EN_ROUTE' | 'CANCELLED'): void {
    if (!this.selectedDelivery) return;

    this.processing = true;
    const orderId = this.selectedDelivery.id;
    const body = { status: status };

    this.http.put(`${this.apiUrl}/deliveries/${orderId}/status`, body, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert(`Order ${this.selectedDelivery.order_number} marked as ${status}`);
          this.selectedDelivery = null;
          this.fetchPendingDeliveries(); // Refresh the list
          this.processing = false;
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Failed to update status. Please check permissions.');
          this.processing = false;
        }
      });
  }

  confirmValidation(): void {
    this.updateDeliveryStatus('EN_ROUTE');
  }

  rejectValidation(): void {
    if (confirm('Are you sure you want to cancel this delivery?')) {
      this.updateDeliveryStatus('CANCELLED');
    }
  }
}