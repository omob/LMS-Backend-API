const Mongoose = require("mongoose");
const config = require("../config");

const options = { useNewUrlParser: true };

Mongoose.connect(config.dbURI, options).then(
  () => console.log("Connection established!..."),
  (err) => console.log(`Error connecting to DB: ${err}`)
);
Mongoose.set("useCreateIndex", true);
