import { Component, Input ,Output,EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-connected-drivers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connected-drivers.component.html',
  styleUrl: './connected-drivers.component.scss'
})
export class ConnectedDriversComponent {

  @Input() items:string[]=["driver1"]
  @Output() suscribe=new EventEmitter<string>()
  handleClick(driverId:string){
    this.suscribe.emit(driverId)
  }
}
