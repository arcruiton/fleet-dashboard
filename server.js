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

// Lock device via script (works on free tier)
app.post("/api/hosts/:id/lock", async (req, res) => {
  try {
    const script_contents = `#!/bin/bash
/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend`;

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
