const mqtt = require('mqtt');

const BROKER = process.env.BROKER || 'mqtt://broker.hivemq.com';
const TOPIC = 'binus-iot-demo/yourname/room1/sensor';

const client = mqtt.connect(BROKER);

client.on('connect', () => {
  console.log('Connected. Listening on', TOPIC);
  client.subscribe(TOPIC);
});

client.on('message', (topic, message) => {
  console.log('Received:', JSON.parse(message.toString()));
});