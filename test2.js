const logger = require("node-color-log");
const { Gumbanded, Gumband } = require("./src/gumbanded");
logger.setLevel("debug");

//create any class that inherits from Gumbanded. pass a tag to claim ownership of settings
class Test extends Gumbanded {
  constructor({ tag = "TEST" } = {}) {
    super({ tag });
  }
}

//Gumbanded uses a singleton instance of Gumband, we can wait until it's ready from anywhere. if already ready, will fire immediately
Gumband.awaitReady().then(() => {});

//if gumband isn't ready yet this will throw a warning.
const a = new Test({tag:'TEST'});
const b = new Test({tag:'TEST2'})

//you can wait on any gumbanded class for when it's ready
a.awaitReady().then(() => {
  //access a current setting value like this, which is automatically updated behind the scenes
  logger.debug(a.TEST_COLOR);
  logger.debug(b.APP_ID, b.TEST_COLOR) //b.TEST_COLOR is null since it belongs to a

  //if it's updated in cloud, this updates
  a.addListener("TEST_COLOR", "onChange", (oldval, newval) => {
    logger.debug("it changed from", oldval, "to", newval);
    logger.debug("to prove it: ", a.TEST_COLOR);
  });

  //we can set it too. Gumbanded strictly enforces values on dropdown settings must be valid items
  //unfortunately we can't return a promse on a setter, which would have allowed for a.TEST_COLOR='BLUE'
  a.set("TEST_COLOR", "BLUE")
    .then((result) => {
      logger.debug("set it.");
    })
    .catch((e) => {
      logger.error(e);
    });
});
