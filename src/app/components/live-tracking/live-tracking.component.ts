import { Component ,Input} from '@angular/core';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../web-socket.service';
import { Subject, Subscription } from 'rxjs';
import { ConnectedDriversComponent } from './connected-drivers/connected-drivers.component';
interface Coordinate{
  lat:number,
  lng:number,
  label:string|"",
  type:string
};


@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [LeafletMapComponent,CommonModule,ConnectedDriversComponent],
  templateUrl: './live-tracking.component.html',
  styleUrl: './live-tracking.component.scss'
})
export class LiveTrackingComponent {
    private wsSubscription!:Subscription;
    private webSubject!:Subject<any>;
    private monitorId:string= 'monitor_1234';
    connectedDrivers:string[]=[]
     @Input() driverCoord!:Coordinate;
    constructor(private websocket:WebSocketService){
    
    }

    ngOnInit(){
         this.webSubject=this.websocket.connect("ws://localhost:8080")
      //suscribe to messages
      this.wsSubscription=this.webSubject.subscribe(
        (msg)=>{
          
           let res=JSON.parse(msg.data)
          if(res.type=="connected_drivers"){
           
            
           console.log(res.connectedDrivers)
           this.connectedDrivers=res.connectedDrivers
          }
          else if(res.type=="location"){
            console.log(res.coord)
            this.driverCoord={
              lat:res.coord.lat,
              lng:res.coord.lng,
              label:res.driverId,
              type:"deliverer"
            }
          }
        }
      
      )

     

         setTimeout(() => {
      this.webSubject.next({ type: 'auth',role:"monitor", monitorId:this.monitorId });
        }, 111); 
        setTimeout(() => {
          this.webSubject.next({ type: 'connected_drivers' });
    
        }, 300);
     

    }

    suscribe(driverId:string){
      this.webSubject.next({
        type:"suscribe",
        driverId:driverId,
        monitorId:this.monitorId
      })
    }

    handleClick(driverId:string){
      console.log(driverId)
      this.suscribe(driverId)
    }




   

}
