# WebSocket Server & Angular Integration

This README explains **how to run the WebSocket server**, **how it works internally**, and **how it is integrated with the Angular application**.

---

## 1. Overview

This WebSocket server is responsible for **real-time communication** between:

* **Drivers** (send location, receive delivery assignments)
* **Monitors** (track connected drivers and receive live locations)

The Angular application connects to this server to:

* Authenticate users (driver / monitor)
* Track connected drivers in real time
* Subscribe monitors to specific drivers
* Send live driver location updates
* Assign deliveries to drivers

---

## 2. Requirements

* Node.js v16+
* npm
* Angular app running separately

---

## 3. How to Run the WebSocket Server

### 3.1 Install dependencies

```bash
npm install ws
```

### 3.2 Start the server

```bash
node server.js
```

You should see:

```text
WebSocket server running on ws://0.0.0.0:8080
```

The server listens on **port 8080** and accepts connections from any network interface.

---

## 4. Server Architecture

### 4.1 In-memory state

The server stores connected clients using JavaScript `Map`s:

* `drivers` → driverId → WebSocket
* `monitors` → monitorId → WebSocket
* `suscriptions` → monitorId → driverId
* `assignments` → driverId → list of deliveries

These are **in-memory only** (reset when server restarts).

---

## 5. Message Protocol (Client ↔ Server)

All messages are **JSON strings** with a `type` field.

### 5.1 Authentication

#### Driver authentication

```json
{
  "type": "auth",
  "role": "driver",
  "driverId": "1"
}
```

Registers the driver and broadcasts updated connected drivers.

#### Monitor authentication

```json
{
  "type": "auth",
  "role": "monitor",
  "monitorId": "monitor_1"
}
```

Registers a monitor and sends the list of connected drivers.

---

### 5.2 Get connected drivers

```json
{
  "type": "connected_drivers"
}
```

Response:

```json
{
  "type": "connected_drivers",
  "connectedDrivers": ["1", "2"]
}
```

---

### 5.3 Subscribe a monitor to a driver

```json
{
  "type": "suscribe",
  "monitorId": "monitor_1",
  "driverId": "1"
}
```

The monitor will now receive live location updates for that driver.

---

### 5.4 Send driver location

```json
{
  "type": "location",
  "driverId": "1",
  "coord": { "lat": 3.848, "lng": 11.502 }
}
```

The server forwards the location to the subscribed monitor.

---

### 5.5 Assign a delivery to a driver

```json
{
  "type": "assign",
  "driverId": "1",
  "delivery": "DEL-001"
}
```

The server stores the assignment and sends it to the driver.

---

## 6. Angular Integration

### 6.1 WebSocket connection (Angular service)

```ts
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'auth',
    role: 'driver',
    driverId: '1'
  }));
};
```

---

### 6.2 Listening for messages

```ts
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'connected_drivers':
      console.log(data.connectedDrivers);
      break;

    case 'location':
      console.log(data.coord);
      break;

    case 'assign':
      console.log(data.deliveries);
      break;
  }
};
```

---

### 6.3 Angular service-based design

* WebSocket logic lives inside an **Angular service**
* Components subscribe to RxJS `Subject`s
* Keeps UI reactive and clean

---

## 7. Testing with wscat

```bash
wscat -c ws://localhost:8080
```

Send:

```json
{"type":"auth","role":"driver","driverId":"1"}
```

---

## 8. Notes & Limitations

* No persistence (data lost on restart)
* No authentication validation yet
* Single monitor per driver subscription

---

## 9. Future Improvements

* Persist drivers & assignments (DB)
* Multiple monitors per driver
* JWT authentication
* Heartbeat / reconnect logic

---

## Author

Project developed for real-time driver monitoring using WebSockets and Angular.
