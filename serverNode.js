const { VectorClock } = require("./vectorClock")

class ServerNode {

  constructor(serverDetails) {
    this.id = serverDetails.id
    this.name = serverDetails.name
    this.ip = serverDetails.ip
    this.data = {}

    this.clock = new VectorClock()
  }

  put(key, value) {
    this.data[ key ] = value
  }

  get(key) {
    return this.data[ key ]
  }

  getData() {
    return this.data
  }

}

module.exports = {
  ServerNode
}