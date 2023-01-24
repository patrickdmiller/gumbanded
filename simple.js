require("dotenv").config();
const { Gumband } = require("./src/gumband-singleton");
const logger = require("node-color-log");

Gumband.setup({
  token:process.env.GUMBAND_TOKEN,
  exhibitId: "1",
  manifestLocation: "./config/manifest.json",
  options: {
    customServerIP: "192.168.3.91",
    endpoint: "custom",
    version: "v1",
    contentLocation: "./content",
  },
});
require("./simplemodule");
