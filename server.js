const client = require("prom-client");
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total requests"
});

register.registerMetric(httpRequestCounter);




const express = require("express");
const app = express();

app.use(express.json());

// login
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (user === "admin" && pass === "1234") {
    return res.json({ message: "Login correcto" });
  }

  res.status(401).json({ message: "Credenciales incorrectas" });
});

// formulario 
app.post("/form", (req, res) => {
  const { nombre, producto } = req.body;

  if (!nombre || !producto) {
    return res.status(400).json({ message: "Campos incompletos" });
  }

  res.json({ message: "Formulario recibido", data: { nombre, producto } });
});

app.get("/", (req, res) => {
  res.send("App funcionando 🚀");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});

