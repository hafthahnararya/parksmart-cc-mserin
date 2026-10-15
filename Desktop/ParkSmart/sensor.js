const mqtt = require('mqtt');

const BROKER = process.env.BROKER || 'mqtt://broker.hivemq.com';
// Change "yourname" so you don't mix with other students on the public broker
const TOPIC = 'binus-iot-demo/yourname/room1/sensor';

const client = mqtt.connect(BROKER);

client.on('connect', () => {
  console.log('Connected to', BROKER);

  setInterval(() => {
    const data = {
      sensorId: 'sensor-01',
      temperature: +(24 + Math.random() * 6).toFixed(1), // 24-30 °C
      humidity: +(50 + Math.random() * 20).toFixed(1),   // 50-70 %
      timestamp: new Date().toISOString()
    };
    client.publish(TOPIC, JSON.stringify(data));
    console.log('Published:', data);
  }, 5000); // 5000 ms = 5 seconds
});

client.on('error', (err) => console.error('Error:', err.message));