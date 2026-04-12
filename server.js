const path = require("path");

const { version } = require("./version");

const client = require("prom-client");
const register = new client.Registry();

// métricas por defecto
client.collectDefaultMetrics({ register });

// contador de requests
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total requests",
  registers: [register]
});

const express = require("express");
const app = express();

app.use(express.json());

// 🔹 FRONT (index.html)
app.get("/", (req, res) => {
  httpRequestCounter.inc();
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 LOGIN
app.post("/login", (req, res) => {
  httpRequestCounter.inc();

  const { user, pass } = req.body;

  if (user === "admin" && pass === "1234") {
    return res.json({ message: "Login correcto" });
  }

  res.status(401).json({ message: "Credenciales incorrectas" });
});

// 🔹 FORMULARIO
app.post("/form", (req, res) => {
  httpRequestCounter.inc();

  const { nombre, producto } = req.body;

  if (!nombre || !producto) {
    return res.status(400).json({ message: "Campos incompletos" });
  }

  res.json({
    message: "Formulario recibido",
    data: { nombre, producto }
  });
});

// 🔹 VERSION (endpoint adicional)
app.get("/version", (req, res) => {
  httpRequestCounter.inc();
  res.send(`Versión: ${version}`);
});

// 🔹 METRICS
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});