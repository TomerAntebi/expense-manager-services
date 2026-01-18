/*
 C:
 Users service entry point.
 - Loads environment variables (.env)
 - Connects to MongoDB
 - Starts the Express server (separate process)
*/
require("dotenv").config({ quiet: true });
const connectToDB = require("./src/utils/mongoose");

// ++c Express app (mounted routes live in app.js)
const app = require("./app");
const port = process.env.PORT || 4000;

// ++c Connect to MongoDB Atlas via MONGO_URI
connectToDB(process.env.MONGO_URI);

// ++c Health/root route
app.get("/", (req, res) => {
  res.send("<p>ello CodeSandbox!<p>");
});

// ++c Start listening (separate process requirement)
app.listen(port, () => {
  console.log(`Sandbox listening on port ${port}`);
});
