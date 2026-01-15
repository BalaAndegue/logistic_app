const ws=new WebSocket("ws://localhost:8080")
ws.onopen=()=>{
console.log('Connected to WebSocket');

  // Authenticate driver
  ws.send(JSON.stringify({ type: 'auth',role:"driver", driverId: '2' }));

  setInterval(()=>{
  ws.send(JSON.stringify({ type: 'location', driverId: '2' ,coord:{
    lat:3.854,
    lng:11.5146752
  }}));

  },500)
}