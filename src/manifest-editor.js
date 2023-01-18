const fs = require("fs");
const logger = require("node-color-log");
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateTagId({ tag, name }) {
  return (tag + "_" + name).toUpperCase();
}

class Setting {
  static fromManifest(manifestSettingNode) {
    let params = manifestSettingNode;
    params.name = generateTagId({ name: manifestSettingNode.name, tag: manifestSettingNode.tag });
    let setting = new this(params);
    for (const item of manifestSettingNode.items) {
      const settingItem = SettingItem.fromManifest(item)
      setting.addItem({settingItem})
    }
    return setting
  }
  constructor({ name, display, id, tag } = {}) {
    this.id = id;
    this.name = name;
    this.display = display;
    this.items = {};
    this.tag = tag;
  }

  addItem({ settingItem }) {
    this.items[settingItem.id] = settingItem;
  }

  setTag({ tag }) {
    this.tag = tag
      .toUpperCase()(this.tag + "_" + this.name)
      .toUpperCase();
  }
}

class SettingItem {
  static fromManifest(manifestSettingItemNode) {
    return new this(manifestSettingItemNode)
  }
  constructor({display, id }) {
    this.id = id
    if (display == null) {
      display = capitalizeFirstLetter(id);
    }
    this.display = display;
  }
}

class ManifestEditor {
  constructor() {}

  async init({ manifestLocation } = {}) {
    this.manifestLocation = manifestLocation;
    this.contents = JSON.parse(fs.readFileSync(this.manifestLocation, "utf8"));
    this.settings = [];
    this.settingsByTagAndName = {};
    this.settingsByTag = {}
    //parse it
    for (const setting of this.contents.manifest.settings) {
      //is there a tag?
      if ("tag" in setting) {
        const _s = Setting.fromManifest(setting);
        this.settings.push(_s)
        this.settingsByTagAndName[_s.id] = _s
        if(!(_s.tag in this.settingsByTag)){
          this.settingsByTag[_s.tag] = []
        }
        this.settingsByTag[_s.tag].push(_s)
      }
    }
  }

  hasSettingWithID({ id }) {
    logger.debug("checking for setting", id);
    let settings = this.contents.manifest.settings;
    for (const setting of settings) {
      if (setting.id == id) {
        return true;
      }
    }
    return false;
  }

  getSettingsWithTag({ tag }) {
    let settings = this.contents.manifest.settings;
    let filteredSettings = [];
    for (const setting of settings) {
      if (setting.tag == tag) {
        filteredSettings.push(setting);
      }
    }
    return filteredSettings;
  }

  hasSettingWithTagAndName({ tag, name }) {
    return this.hasSettingWithID({ id: generateTagId({ tag, name }) });
  }
}

module.exports = { ManifestEditor, Setting, SettingItem };
