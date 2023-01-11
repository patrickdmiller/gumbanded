const { Gumband: _Gumband, Sockets } = require("@deeplocal/gumband-node-sdk");
const logger = require("node-color-log");
const GumbandSetupObject = {};
const fs = require("fs");

const { EventEmitter } = require("events");

class ManifestEditor {
  constructor({ manifestLocation } = {}) {
    this.manifestLocation = manifestLocation;
  }

  async init() {
    this.contents = JSON.parse(fs.readFileSync(this.manifestLocation, 'utf8'));
    console.log(this.contents);
  }
}
let manifest = null;

class Gumband {
  static event = new EventEmitter();
  static isReady = false;
  static isSetup = false;

  constructor() {
    throw new Error("To get an instance of Gumband use Gumband.getInstance()");
  }

  static setup({ token, exhibitId, manifestLocation, options = {} } = {}) {
    if (token == null || exhibitId === null) {
      throw new Error("missing required parameters");
    }
    //update keys not set the object
    for (const key in arguments[0]) {
      GumbandSetupObject[key] = arguments[0][key];
    }
    this.isSetup = true;
    this.getInstance();
  }

  static async awaitReady() {
    return new Promise((resolve, reject) => {
      if (this.isReady) {
        logger.debug("is ready already, returning");
        resolve(_Gumband.instance);
      } else {
        const failTimeout = setTimeout(() => {
          reject("Timed out waiting for gumband to be ready");
        }, 10000);
        logger.debug("not ready, awaiting");
        this.event.once("ready", () => {
          clearTimeout(failTimeout);
          resolve(_Gumband.instance);
        });
      }
    });
  }

  static getInstance({ logTag = null } = {}) {
    if (!this.isSetup) {
      throw new Error("Gumband requires setup before ");
    }
    if (!_Gumband.instance) {
      logger.info("Gumband: instantiating singleton", logTag);
      manifest = new ManifestEditor({manifestLocation:GumbandSetupObject.manifestLocation})
      manifest.init()
      _Gumband.instance = new _Gumband(
        GumbandSetupObject.token,
        GumbandSetupObject.exhibitId,
        GumbandSetupObject.manifestLocation,
        GumbandSetupObject.options
      );
      _Gumband.instance.on(Sockets.READY, () => {
        this.isReady = true;
        this.event.emit("ready");
      });
    } else {
      logger.info("Gumband: getting singleton instance", logTag);
    }
    return _Gumband.instance;
  }
}

module.exports = {
  Sockets,
  Gumband,
  GumbandSetupObject,
  GB: Gumband.getInstance,
};
