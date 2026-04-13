// se importa mysql2 para conectarse a la base de datos
const mysql = require("mysql2");

// se usa path para manejar rutas de archivos
const path = require("path");

// se obtiene la versión desde variables de entorno
const version = process.env.APP_VERSION;

// librería para métricas (prometheus)
const client = require("prom-client");

// registro donde se almacenan las métricas
const register = new client.Registry();

// configuración del pool de conexiones a mysql
const db = mysql.createPool({
  host: "mysql",          // nombre del servicio en docker
  user: "root",
  password: "root",
  database: "appdb",
  waitForConnections: true,
  connectionLimit: 10,    // máximo de conexiones simultáneas
  queueLimit: 0
});

// función que espera a que mysql esté disponible y crea la tabla
function initDB(retries = 15) {

  // prueba conexión con un select simple
  db.query("SELECT 1", (err) => {

    if (err) {
      console.log("⏳ Esperando MySQL...");

      // reintenta conexión si aún no está listo
      if (retries > 0) {
        return setTimeout(() => initDB(retries - 1), 3000);
      } else {
        return console.error("❌ MySQL no respondió");
      }
    }

    console.log("✅ MySQL listo");

    // crea la tabla si no existe
    db.query(`
      CREATE TABLE IF NOT EXISTS registros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        producto VARCHAR(100)
      )
    `, (err) => {
      if (err) {
        console.error("❌ Error creando tabla:", err);
      } else {
        console.log("✅ Tabla lista");
      }
    });
  });
}

// evita ejecutar esto cuando se corre en pruebas
if (process.env.NODE_ENV !== "test") {
  initDB();
}

// se recolectan métricas por defecto del sistema
client.collectDefaultMetrics({ register });

// contador de requests http
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total requests",
  registers: [register]
});

// se importa express
const express = require("express");

// se crea la app
const app = express();

// middleware para leer json en requests
app.use(express.json());

// ruta principal que devuelve el html
app.get("/", (req, res) => {
  httpRequestCounter.inc(); // incrementa contador
  res.sendFile(path.join(__dirname, "index.html"));
});

// endpoint de login
app.post("/login", (req, res) => {
  httpRequestCounter.inc();

  const { user, pass } = req.body;

  // validación de campos
  if (!user || !pass) {
    return res.status(400).json({ message: "Campos requeridos" });
  }

  // validación simple de credenciales
  if (user === "admin" && pass === "1234") {
    return res.json({ message: "Login correcto" });
  }

  // credenciales incorrectas
  res.status(401).json({ message: "Credenciales incorrectas" });
});

// endpoint para guardar datos
app.post("/form", (req, res) => {
  httpRequestCounter.inc();

  const { nombre, producto } = req.body;

  // validación de campos
  if (!nombre || !producto) {
    return res.status(400).json({ message: "Campos incompletos" });
  }

  // inserta en la base de datos
  db.query(
    "INSERT INTO registros (nombre, producto) VALUES (?, ?)",
    [nombre, producto],
    (err) => {

      if (err) {
        console.error("❌ ERROR MYSQL INSERT:", err);

        return res.status(500).json({
          message: "Error al guardar",
          error: err.message
        });
      }

      // respuesta exitosa
      res.json({
        message: "Guardado en MySQL",
        data: { nombre, producto }
      });
    }
  );
});

// endpoint para obtener registros
app.get("/registros", (req, res) => {
  httpRequestCounter.inc();

  db.query("SELECT * FROM registros", (err, results) => {

    if (err) {
      console.error("❌ ERROR SELECT:", err);

      // en caso de error devuelve lista vacía
      return res.json([]);
    }

    res.json(results || []);
  });
});

// endpoint que devuelve la versión
app.get("/version", (req, res) => {
  httpRequestCounter.inc();
  res.send(`Versión: ${version}`);
});

// endpoint para métricas (prometheus)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// puerto del servidor
const PORT = process.env.PORT || 3000;

// levanta el servidor solo si no está en modo test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
  });
}

// exporta la app para pruebas
module.exports = app;