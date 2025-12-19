let button=document.getElementById("connect")
let status=document.getElementById("status")
let disconnect=document.getElementById("disconnect")
let ws;

button.addEventListener("click",()=>{

 ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => {
    console.log('Connected to WebSocket');
    
    status.innerText="Connected"
    // Authenticate driver
    ws.send(JSON.stringify({ type: 'auth', role: "driver", driverId: 'driver_123' }));

 let lastSent = 0;

  navigator.geolocation.watchPosition(
    (pos) => {
      const now = Date.now();

      // throttle to 500ms
      if (now - lastSent < 500) return;
      lastSent = now;

      console.log({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        })
      
      ws.send(JSON.stringify({
        type: "location",
        driverId: "driver_123",
        coord: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        },
        timestamp: pos.timestamp
      }));
    },
    (err) => {
      console.error("Geo error:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0
    }
  );
  };

  ws.onclose=()=>{
    status.innerText="Disconnected"
  }
  /*
  *
)
  */
})

disconnect.addEventListener("click",()=>{
  if(ws) ws.close()
})