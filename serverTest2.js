const ws=new WebSocket("ws://localhost:8080")
ws.onopen=()=>{
console.log('Connected to WebSocket');

  // Authenticate driver
  ws.send(JSON.stringify({ type: 'auth',role:"driver", driverId: 'driver_1234' }));

  setInterval(()=>{
  ws.send(JSON.stringify({ type: 'location', driverId: 'driver_1234' ,coord:{
    lat:3.854,
    lng:11.5146752
  }}));

  },500)
}