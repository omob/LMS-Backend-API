if (process.env.NODE_ENV === "production") {
  module.exports = {
    host: process.env.host || "",
    dbURI: process.env.dbURI,
    sessionSecret: process.env.sessionSecret,
    port: process.env.PORT,
    domain: "unilag.edu.ng",
    tokenExpire: process.env.tokenExpire,
  };
} else {
  module.exports = require("./development.json");
}
