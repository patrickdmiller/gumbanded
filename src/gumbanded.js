const logger = require("node-color-log");
const ALL_TAGS = new Set();
const { Gumband, Sockets } = require("./gumband-singleton");

class Gumbanded {
  constructor({ tag } = {}) {
    if (tag !== null) {
      if (ALL_TAGS.has(tag)) {
        throw new Error(`Tag ${tag} already assigned`);
      }
      logger.info(`Tag: ${tag} registered`)
    }
    this.gbTag = tag
    this.gb = Gumband.getInstance({logTag:'gumbanded'});
  }

  addSetting(variable, other ={}){
    //first check if it's in the manifest, if not add it
    let match = null
    for(const setting of this.gb.manifest.settings){
      if('tag' in setting && setting.tag == this.gbTag){
        match = setting
      }
    }
    if(!match){
      logger.debug("no match")

    }
  }
}

module.exports = {
  Gumbanded,
  Gumband, Sockets
};
