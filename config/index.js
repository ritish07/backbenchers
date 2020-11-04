require("dotenv").config();

module.exports = {
  DB: process.env.APP_DB,
  PORT: process.env.PORT || process.env.APP_PORT,
  SECRET: process.env.APP_SECRET,
  HOST: process.env.YOUR_HOST ||process.env.APP_HOST
};