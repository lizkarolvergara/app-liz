// se usa supertest para simular peticiones http a la aplicación
const request = require("supertest");

// se hace un mock de mysql2 para evitar usar una base de datos real
jest.mock("mysql2", () => {
  return {
    createPool: () => ({
      // se simula el método query de mysql
      query: (sql, params, callback) => {
        // se simula un insert exitoso
        callback(null, { insertId: 1 });
      }
    })
  };
});

// se importa el servidor que se va a probar
const app = require("./server");

// pruebas del endpoint login
describe("POST /login", () => {
  it("login correcto", async () => {

    // se envían credenciales válidas
    const res = await request(app)
      .post("/login")
      .send({
        user: "admin",
        pass: "1234"
      });

    // se espera respuesta correcta
    expect(res.statusCode).toBe(200);
  });
});

// pruebas del endpoint form
describe("POST /form", () => {

  it("debe guardar correctamente", async () => {

    // se envían datos completos
    const res = await request(app)
      .post("/form")
      .send({
        nombre: "Liz",
        producto: "Perfume"
      });

    // se valida respuesta exitosa
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Guardado en MySQL");
  });

  it("debe fallar si faltan campos", async () => {

    // se envían datos incompletos
    const res = await request(app)
      .post("/form")
      .send({
        nombre: ""
      });

    // se espera error de validación
    expect(res.statusCode).toBe(400);
  });
});