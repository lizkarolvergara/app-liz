const request = require("supertest");

// 🔥 MOCK MYSQL
jest.mock("mysql2", () => {
  return {
    createPool: () => ({
      query: (sql, params, callback) => {
        // simula INSERT exitoso
        callback(null, { insertId: 1 });
      }
    })
  };
});

const app = require("./server");

describe("POST /login", () => {
  it("login correcto", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        user: "admin",
        pass: "1234"
      });

    expect(res.statusCode).toBe(200);
  });
});

describe("POST /form", () => {
  it("debe guardar correctamente", async () => {
    const res = await request(app)
      .post("/form")
      .send({
        nombre: "Liz",
        producto: "Perfume"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Guardado en MySQL");
  });

  it("debe fallar si faltan campos", async () => {
    const res = await request(app)
      .post("/form")
      .send({
        nombre: ""
      });

    expect(res.statusCode).toBe(400);
  });
});