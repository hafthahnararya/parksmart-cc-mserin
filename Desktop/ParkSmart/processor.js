const mqtt = require("mqtt");
const crypto = require("crypto");

// Must match sensor.js
const BROKER_URL = process.env.BROKER || "mqtt://broker.hivemq.com";
const BASE_TOPIC = "parksmart/ata2026"; // same value as in sensor.js
const LOT_ID = "lot-A";
const TOPIC = `${BASE_TOPIC}/${LOT_ID}/#`;

const client = mqtt.connect(BROKER_URL, {
  connectTimeout: 10000,
  reconnectPeriod: 2000,
});

client.on("connect", () => {
  console.log("✅ Backend connected to MQTT broker:", BROKER_URL);

  client.subscribe(TOPIC, (err) => {
    if (err) console.error("❌ Subscribe error:", err.message);
    else console.log("👂 Backend listening on topic:", TOPIC);
  });
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // skip the lot summary, only hash per-slot sensor readings
    if (topic.endsWith("/summary")) return;

    // Generate SHA256 hash
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");

    // Prepare payload for blockchain storage
    const blockchainReadyPayload = {
      deviceId: `${data.lotId}/${data.slotId}`,
      dataHash: hash,
      receivedAt: new Date().toISOString(),
    };

    console.log("\n📥 Data received:");
    console.log(data);
    console.log("🔐 SHA256 Hash:");
    console.log(hash);
    console.log("📦 Blockchain-ready payload:");
    console.log(blockchainReadyPayload);
  } catch (err) {
    console.error("❌ Error processing message:", err.message);
    console.error("Raw message:", message.toString());
  }
});

client.on("reconnect", () => console.log("🔄 Reconnecting to broker..."));
client.on("error", (err) => console.error("❌ MQTT error:", err.message));
client.on("close", () => console.log("🔌 Connection closed"));
