import { Component, Input ,Output,EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Driver } from '../../../services/driver.service';
@Component({
  selector: 'app-connected-drivers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connected-drivers.component.html',
  styleUrl: './connected-drivers.component.scss'
})
export class ConnectedDriversComponent {

  @Input() drivers!:Driver[]
  @Output() suscribe=new EventEmitter<string>()
  handleClick(driverId:number){
    this.suscribe.emit(driverId.toString())
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'AVAILABLE': 'badge-success',
      'BUSY': 'badge-warning',
      'OFFLINE': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'AVAILABLE': 'Disponible',
      'BUSY': 'Occupé',
      'OFFLINE': 'Hors ligne'
    };
    return labels[status] || status;
  }

  getVehicleIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      'BIKE': 'bi-bicycle',
      'SCOOTER': 'bi-scooter',
      'CAR': 'bi-car-front',
      'VAN': 'bi-truck'
    };
    return icons[vehicleType] || 'bi-person';
  }

  getVehicleLabel(vehicleType: string): string {
    const labels: { [key: string]: string } = {
      'BIKE': 'Vélo',
      'SCOOTER': 'Scooter',
      'CAR': 'Voiture',
      'VAN': 'Camionnette'
    };
    return labels[vehicleType] || vehicleType;
  }
}
