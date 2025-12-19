import { Component, OnInit, AfterViewInit ,Input, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import "leaflet-routing-machine"


interface Coordinate{
  lat:number,
  lng:number,
  label:string|"",
  type:string
};


@Component({
  selector: 'app-map',
  standalone:true,
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css']
})

export class LeafletMapComponent implements OnInit, AfterViewInit {
  private map!: L.Map
   startCordinate:Coordinate={
    lat:3.8567936,
    lng: 11.5146752,
    type:"deliverer",
    label:"deliverId"
    
  }
  private delivererMarker!:L.Marker
  private watchId!:number;
  @Input() driverCoord:Coordinate=this.startCordinate;
   deliveryIcon=L.icon(
    {
  iconUrl: 'assets/delivery.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
}
  )

  targetIcon=L.icon({
     iconUrl: 'assets/target.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
  })
 
 
  stopCordinate:Coordinate={
    lat:3.8567936,
    lng: 11.515,
    type:"target",
    label:"targetID"
    
  }
  markers: L.Marker[] = [
    L.marker([3.848, 11.5021]) // Dhaka, Bangladesh
  ];

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initMap();
    this.centerMap();
 
    this.tracePath(this.driverCoord,this.stopCordinate);

    //this.updateCoordinates()
  }


  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }


  ngOnChanges(changes: SimpleChanges) {
    
    console.log("changed")
    console.log(this.delivererMarker)
    this.delivererMarker?.setLatLng([this.driverCoord.lat,this.driverCoord.lng])

  if (changes['driverCoord'] && !changes['driverCoord'].currentValue) {
    console.log("here")
    this.driverCoord = this.startCordinate;
  }
}


  private centerMap() {
    // Create a boundary based on the markers
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));
    
    // Fit the map into the boundary
    this.map.fitBounds(bounds);
  }

  private addMarker(coord:Coordinate){
    if(coord.type=="deliverer"){
      this.delivererMarker=L.marker(
      [coord.lat,coord.lng],{icon:this.deliveryIcon}
    ).addTo(
      this.map
    ).bindPopup(coord.label)
    .openPopup()
    }
    else{
      L.marker(
      [coord.lat,coord.lng],{icon:this.targetIcon}
    ).addTo(
      this.map
    ).bindPopup(coord.label)
    .openPopup()
      
    }


    


  }

  private tracePath(startCoord:Coordinate ,stopCoord:Coordinate){
    const plan = new (L as any).Routing.Plan(
      [[startCoord.lat,startCoord.lng],
        [stopCoord.lat,stopCoord.lng]],
  {
    createMarker: () => null 
  }
);


    this.addMarker(this.driverCoord);
    this.addMarker(stopCoord);
  let control=  (L as any).Routing.control({
    plan:plan,
  routeWhileDragging: true,
  
  addWaypoints: false, 
  show: false ,         
}).addTo(this.map);

  control.hide()


  }

  resetMap() {
  this.map.eachLayer((layer) => {
   
    if (!(layer instanceof L.TileLayer)) {
      this.map.removeLayer(layer);
    }
  });

  
  this.markers = [];

}

    updateCoordinates(){
    this.watchId=  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      console.log({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      time: new Date(position.timestamp).toISOString()
    });
      if (!this.delivererMarker) {
        // Create marker once
        this.delivererMarker = L.marker([lat, lng], {
          icon: this.deliveryIcon
        }).addTo(this.map);
      } else {
        // Move marker
        this.delivererMarker.setLatLng([lat, lng]);
      }
    },
    (error) => console.error(error),
    {
      enableHighAccuracy: true,
      maximumAge: 1000
    }
  );
    }


}