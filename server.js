const express = require("express");
const { randomUUID } = require("crypto");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const FLEET_URL = process.env.FLEET_URL || "https://fleet-dm.up.railway.app";
const FLEET_TOKEN = process.env.FLEET_TOKEN;

function fleetHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${FLEET_TOKEN}`,
  };
}

// List all hosts
app.get("/api/hosts", async (req, res) => {
  try {
    const r = await fetch(`${FLEET_URL}/api/v1/fleet/hosts`, {
      headers: fleetHeaders(),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single host
app.get("/api/hosts/:id", async (req, res) => {
  try {
    const r = await fetch(`${FLEET_URL}/api/v1/fleet/hosts/${req.params.id}`, {
      headers: fleetHeaders(),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Lock device via MDM custom command
app.post("/api/hosts/:uuid/lock", async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const commandUUID = randomUUID().toUpperCase();
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Command</key>
  <dict>
    <key>RequestType</key>
    <string>DeviceLock</string>
  </dict>
  <key>CommandUUID</key>
  <string>${commandUUID}</string>
</dict>
</plist>`;

    const encoded = Buffer.from(plist).toString("base64");

    const r = await fetch(`${FLEET_URL}/api/v1/fleet/mdm/commands/run`, {
      method: "POST",
      headers: fleetHeaders(),
      body: JSON.stringify({ command: encoded, device_ids: [uuid] }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Run a script on a host
app.post("/api/hosts/:id/script", async (req, res) => {
  try {
    const { script_contents } = req.body;
    const r = await fetch(`${FLEET_URL}/api/v1/fleet/scripts/run/sync`, {
      method: "POST",
      headers: fleetHeaders(),
      body: JSON.stringify({ host_id: parseInt(req.params.id), script_contents }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get software for a host
app.get("/api/hosts/:id/software", async (req, res) => {
  try {
    const r = await fetch(
      `${FLEET_URL}/api/v1/fleet/hosts/${req.params.id}/software`,
      { headers: fleetHeaders() }
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fleet dashboard running on port ${PORT}`));
