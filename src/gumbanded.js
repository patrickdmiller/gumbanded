const logger = require("node-color-log");
const ALL_TAGS = new Set();
const { Gumband, Sockets, Manifest } = require("./gumband-singleton");
logger.debug("MANIFEST", Manifest);
const varToString = (varObj) => Object.keys(varObj)[0];
const readline = require("readline");
const readlineSync = require("readline-sync");
const { EventEmitter } = require("stream");

class Gumbanded extends EventEmitter {
  constructor({ tag } = {}) {
    super();
    if (!Gumband.isReady) {
      logger.warn("Gumband not ready yet. waiting to set up things.");
    }

    Gumband.awaitReady().then(() => {
      this._settings = {};
      this._settingIDs = new Set();
      this.tag = tag.toUpperCase();
      this.gb = Gumband.getInstance({ logTag: "gumbanded" });
      //now we autogenerate any gumband settings for this.
      this.updateFromManifest();
      this.emit("ready");
    });

    if (tag !== null) {
      if (ALL_TAGS.has(tag)) {
        throw new Error(`Tag ${tag} already assigned`);
      }
      logger.info(`Tag: ${tag} registered`);
    }
  }

  awaitReady() {
    console.log("hrm");
    return new Promise((resolve, reject) => {
      if (Gumband.isReady) {
        logger.debug("already ready");
        resolve();
      } else {
        this.on("ready", () => {
          console.log("FIRED");
          resolve();
        });
      }
    });
  }

  updateFromManifest() {
    for (const setting of Gumband.manifest.settingsByTag[this.tag]) {
      this.addSetting({ setting });
    }
  }
  addListener(key, event, f) {
    this._settings[key].e.on(event, f);
  }
  addSetting({ setting }) {
    // console.log("need to add setting!", setting)
    let id = setting.id;

    this._settings[id] = {
      o: setting,
      manifestO: null,
      value: null,
      e: new EventEmitter(),
    };
    for (const manifestSetting of this.gb.manifest.settings) {
      if (manifestSetting.manifestId == id) {
        this._settings[id].manifestO = manifestSetting;

        this._settings[id].value = this._settings[id].manifestO.value;
      }
    }
    this._settingIDs.add(id);

    Object.defineProperty(this, id, {
      get() {
        const internalKey = id;
        // console.log("fetching", internalKey);
        if (this._settings[internalKey].value !== null) {
          return this._settings[internalKey].value;
        }
        return this._settings[internalKey].value;
      },
      set(value) {
        throw new Error("do not set directly, please use set() on the class");
        const internalKey = id;
        logger.debug("checking if ", value, "is valid", this._settings[internalKey].o.items[value]);

        if (value in this._settings[internalKey].o.items) {
          logger.success(value, " is a valid setting");
          this._settings[internalKey].value = this._settings[internalKey].o.items[value];
        } else {
          logger.success(value, " is an invalid setting");
        }
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 1000);
        });
      },
    });

    //add a listener for this
    Gumband.listeners.settings[id] = this._settings[id];
  }

  set(key, val) {
    return new Promise((resolve, reject) => {
      if (this._settings[key] && this._settings[key].o.items[val]) {
        this.gb.setSetting(key, val).then((result) => {
          resolve(result);
        });
      } else {
        reject(`invalid value ${val}, valid values = ${Object.keys(this._settings[key].o.items)}`);
      }
    });
  }

  addSettingO({ setting }) {
    // console.log("need to add setting!", setting)
    let varName = setting.name;
    if (Gumband.manifest.hasSettingWithTagAndName({ tag: this.tag, name: varName })) {
      logger.warn("this already exists, skipping creation");
      return;
    }
    this._settings[varName] = {
      o: setting,
      value: null,
    };

    Object.defineProperty(this, varName, {
      get() {
        const internalKey = varName;
        if (this._settings[internalKey].value !== null) {
          return this._settings[internalKey].value.name;
        }
        return this._settings[internalKey].value;
      },
      set(value) {
        const internalKey = varName;
        logger.debug("checking if ", value, "is valid", this._settings[internalKey].o.items[value]);

        if (value in this._settings[internalKey].o.items) {
          logger.success(value, " is a valid setting");
          this._settings[internalKey].value = this._settings[internalKey].o.items[value];
        } else {
          logger.success(value, " is an invalid setting");
        }

        // this._settings[internalKey] = value;
      },
    });
  }
  addSetting__({ varName, type = "Dropdown", display = null, items } = {}) {
    if (this.hasOwnProperty(varName)) {
      throw new Error(`${varName} already exists on object. setting names must be unique`);
    }

    if (display === null) {
      display = varName;
      display[0] = display[0].toUpperCase();
    }

    if (items == null) {
      throw new Error("dropdown settings need at least 1 item.");
    }

    /*
    this lets us create settings variables with a setter/getter so we can wrap it in manifest logic
    for example, if you subclass gumbanded on a class named TEST, you can do...
      let test = new TEST()
      test.addSetting('testvar')
      test.testvar = 'value'
    */
    Object.defineProperty(this, varName, {
      get() {
        const internalKey = varName;
        return this._settings[internalKey];
      },
      set(value) {
        const internalKey = varName;
        logger.debug("setting", internalKey, "to", value);
        this._settings[internalKey] = value;
      },
    });

    if (!Manifest.hasSettingWithTagAndName({ tag: this.tag, name: varName })) {
      logger.debug(varName, "no match");
      let choice = readlineSync.question("May I have your name? !!!!!!!!!!!!! ");
      if (process.env.GUMBANDED_CREATE == "true") {
        logger.success("creating setting", varName);
      } else {
        logger.error("please rerun this application with environment variable GUMBANDED_CREATE=true");
        process.exit();
      }
    } else {
      logger.debug("it matches already");
    }
  }
}

module.exports = {
  Gumbanded,
  Gumband,
  Sockets,
};
