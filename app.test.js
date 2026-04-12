const http = require("http");

test("Servidor responde correctamente", (done) => {
  http.get("http://localhost:3000", (res) => {
    expect(res.statusCode).toBe(200);
    done();
  });
});