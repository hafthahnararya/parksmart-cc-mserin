const mqtt = require('mqtt');

const BROKER = process.env.BROKER || 'mqtt://broker.hivemq.com';
const BASE_TOPIC = 'parksmart/ata2026'; // must match the sensor
const LOT_ID = 'lot-A';
const TOPIC = `${BASE_TOPIC}/${LOT_ID}/#`;

const slots = {};
let summary = null;
let timer = null;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function draw() {
  console.clear();
  console.log(`${BOLD}PARKSMART - ${LOT_ID}${RESET}`);
  console.log('-'.repeat(44));
  console.log(`${'SLOT'.padEnd(6)}${'STATUS'.padEnd(14)}${'DISTANCE'.padEnd(11)}BATTERY`);
  console.log('-'.repeat(44));

  Object.keys(slots).sort().forEach((id) => {
    const s = slots[id];
    const color = s.occupied ? RED : GREEN;
    const label = (s.occupied ? 'Occupied' : 'Free').padEnd(12);
    const distance = `${s.distanceCm} cm`.padEnd(11);
    console.log(`${id.padEnd(6)}${color}● ${label}${RESET}${distance}${s.batteryPct}%`);
  });

  console.log('-'.repeat(44));
  if (summary) {
    const bar = '█'.repeat(summary.occupiedCount) + '░'.repeat(summary.availableCount);
    console.log(`${BOLD}Free: ${summary.availableCount} of ${summary.totalSlots}${RESET}   ${bar}`);
  }
  console.log(`${DIM}Last update: ${new Date().toLocaleTimeString()}${RESET}`);
}

const client = mqtt.connect(BROKER);

client.on('connect', () => {
  console.log('Connected. Waiting for data on', TOPIC);
  client.subscribe(TOPIC);
});

client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());

  if (topic.endsWith('/summary')) {
    summary = data;
  } else {
    slots[data.slotId] = data;
  }

  // redraw once after the burst of messages, so the screen doesn't flicker
  clearTimeout(timer);
  timer = setTimeout(draw, 300);
});

client.on('error', (err) => console.error('Error:', err.message));