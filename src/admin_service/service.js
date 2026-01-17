require("dotenv").config({ quiet: true });
const express = require("express");
const adminController = require("./src/controller/admin_controller");
const connectToDB = require("./src/utils/mongoose");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

connectToDB(process.env.MONGO_URI);

// 2. Mount the router
app.use("/", adminController);
console.log("service");

app.get("/", (req, res) => {
  res.send("<p>ello CodeSandbox!<p>");
});

app.listen(port, () => {
  console.log(`Sandbox listening on port ${port}`);
});
