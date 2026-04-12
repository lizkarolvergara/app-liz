const fs = require("fs");

if (fs.existsSync("./server.js")) {
  console.log("✅ Test OK - archivo existe");
  process.exit(0);
} else {
  console.error("❌ Test FAIL - archivo no existe");
  process.exit(1);
}