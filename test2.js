const logger = require('node-color-log')
const {Gumbanded, Gumband} = require('./src/gumbanded')
logger.setLevel('debug')

//Gumbanded uses a singleton instance of Gumband, we can wait until it's ready from anywhere
Gumband.awaitReady( ()=>{
  console.log('ready!@')
})

class Test extends Gumbanded{
  constructor({tag = 'TEST'}={}){
    super({tag}) //this is how we know what settings belong to this object
  }
}

const a = new Test()

//access a current setting value like this, which is automatically updated behind the scenes
console.log(a.TEST_COLOR)

//if it's updated in cloud, this updates
a.addListener('TEST_COLOR', 'onChange', (oldval, newval)=>{
  console.log("it changed from", oldval, "to", newval)
  console.log("to prove it: ", a.TEST_COLOR)
})

//we can set it too. Gumbanded strictly enforces values on dropdown settings must be valid items
//unfortunately we can't return a promse on a setter, which would have allowed for a.TEST_COLOR='BLUE'
a.set('TEST_COLOR', 'BLUE')
.then(result=>{
  logger.debug("set it.")
})
.catch(e=>{
  logger.error(e)
})