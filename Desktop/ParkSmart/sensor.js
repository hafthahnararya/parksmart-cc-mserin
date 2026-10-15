const mqtt = require('mqtt');

const BROKER = process.env.BROKER || 'mqtt://broker.hivemq.com';
const BASE_TOPIC = 'parksmart/yourname'; // change "yourname"
const LOT_ID = 'lot-A';
const SLOT_COUNT = 6;

const slots = Array.from({ length: SLOT_COUNT }, (_, i) => ({
  slotId: `A${i + 1}`,
  occupied: Math.random() < 0.5,
  batteryPct: 100
}));

const rand = (min, max) => Math.round(min + Math.random() * (max - min));

const client = mqtt.connect(BROKER);

client.on('connect', () => {
  console.log('Connected to', BROKER);

  setInterval(() => {
    slots.forEach((slot) => {
      // 15% chance a car arrives or leaves
      if (Math.random() < 0.15) {
        slot.occupied = !slot.occupied;
      }
      slot.batteryPct = Math.max(0, +(slot.batteryPct - 0.05).toFixed(2));

      const data = {
        lotId: LOT_ID,
        slotId: slot.slotId,
        occupied: slot.occupied,
        distanceCm: slot.occupied ? rand(10, 60) : rand(150, 300),
        timestamp: new Date().toISOString()
      };

      // retain: true = new subscribers instantly get the latest status
      client.publish(`${BASE_TOPIC}/${LOT_ID}/${slot.slotId}`, JSON.stringify(data), { retain: true });
    });

    const occupiedCount = slots.filter((s) => s.occupied).length;
    const summary = {
      lotId: LOT_ID,
      totalSlots: SLOT_COUNT,
      occupiedCount,
      availableCount: SLOT_COUNT - occupiedCount,
      timestamp: new Date().toISOString()
    };
    client.publish(`${BASE_TOPIC}/${LOT_ID}/summary`, JSON.stringify(summary), { retain: true });
    console.log(`[${new Date().toLocaleTimeString()}] Sent ${SLOT_COUNT} slot updates | ${summary.availableCount} free of ${SLOT_COUNT}`);
  }, 5000);
});

client.on('error', (err) => console.error('Error:', err.message));