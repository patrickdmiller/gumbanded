const logger = require("node-color-log");
const { Gumbanded, Gumband } = require("./src/gumbanded");
const {MyCoolClass} = require("./mycoolclass")

logger.setLevel("debug");


a = new MyCoolClass({tag:'TEST'})

//you can have diferent objects pick up different settings by tag
b = new MyCoolClass({tag:'TEST2'})

//you can use Gumband ready or a will also tell you when you're ready
a.awaitReady().then( ()=>{

  //can manually add a listener
  a.addListener("TEST_COLOR", "onChange", (oldval, newval) => {
    logger.debug("it changed from", oldval, "to", newval);
    logger.debug("to prove it: ", a.TEST_COLOR);
  });

  //or just access it when you need it
  setInterval( ()=>{
    logger.info(`This is a.TEST_ONETWO and I'm always in syc ${a.TEST_ONETWO}`)
    logger.info(`I'm b.APP_ID ${b.APP_ID}`)
  }, 1000)

  //we also get errors if we're out of spec
  a.set("TEST_COLOR", "pink!")
  .then((result) => {
    logger.debug("set it.");
  })
  .catch((e) => {
    logger.error(e);
  });
})

