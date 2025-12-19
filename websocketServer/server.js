const WebSocket = require('ws');

const PORT = 8080;

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT,host:'0.0.0.0' });

wss.on('listening', () => {
  console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);
});

// Map to store connected clients by driverId
const drivers = new Map();
const monitors=new Map();
const suscriptions=new Map();
const assignments=new Map();

function broadcastConnectedDrivers() {
  const list = Array.from(drivers.keys());
  monitors.forEach(ws => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'connected_drivers',
        connectedDrivers: list
      }));
    }
  });
}



wss.on('connection', (ws) => {
  console.log('New client connected');

  // Store driverId after auth
  let driverId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'auth':

        if(data.role=="driver"){
             // Client sends: { type: 'auth', driverId: 'driver_123' }
          driverId = data.driverId;
          drivers.set(driverId, ws);
          console.log(`Driver registered: ${driverId}`);
            broadcastConnectedDrivers()
          //update all monitors

        }
        else if(data.role=="monitor"){
            console.log("A monitor connected")
            let monitorId=data.monitorId;
            monitors.set(monitorId,ws)
            console.log(`Monitor connected ${monitorId}`)
            broadcastConnectedDrivers()
        }
         
          break;


        /**case 'location':
          // Client sends: { type: 'location', driverId, lat, lng }
          console.log(`Location from ${data.driverId}: ${data.lat}, ${data.lng}`);

          // Broadcast to all other clients (or filter subscribers)
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
              client.send(JSON.stringify({
                type: 'driver_location',
                driverId: data.driverId,
                lat: data.lat,
                lng: data.lng,
                timestamp: data.timestamp || Date.now()
              }));
            }
          });
          break; */
        case "connected_drivers":
            ws.send(JSON.stringify({type:"connected_drivers",
                                    connectedDrivers:Array.from(drivers.keys())

                                }))
            break;
        case "suscribe":
             let monitorId=data.monitorId;
             driverId=data.driverId
            suscriptions.set(monitorId,driverId)
            console.log(`monitore with id ${monitorId} suscribed to driver with id ${driverId}`);

            break;
            
        case "assign":
          let delivery=data.delivery
          driverId=data.driverId
          if(assignments.get(driverId)){
            assignments.get(driverId).push(delivery)

          }else{
            assignments.set(driverId,[delivery])

          }
          console.log(`assigned ${delivery} to deliver ${driverId}`)
          drivers.get(driverId).send(
            {
              type:"assign",
              deliveries:assignments.get(driverId)
            }
          )
          break;
          
        
          

        case "location":
             driverId=data.driverId;
             let monitorID=null;

            for (const [monitorId,driver] of suscriptions.entries()) {
              if(driver==driverId){
                monitorID=monitorId;
              }
            }
            
            if(monitorID!=null){
                const monitorWs=monitors.get(monitorID)
            if( monitorWs && monitorWs.readyState===WebSocket.OPEN){
                monitorWs.send(JSON.stringify({
                    type:"location",
                    driverId:driverId,
                    coord:data.coord
                }))
            }
            }
             else{
                console.log(data.coord)
             }
            break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('Invalid message', err);
    }
  });

  ws.on('close', () => {
    
    if (driverId) drivers.delete(driverId);
    //alert monitors
    broadcastConnectedDrivers()
    console.log(`Client disconnected: ${driverId || 'unknown'}`);
  });
});
