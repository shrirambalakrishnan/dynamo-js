class VectorClock {

  constructor() {
    this.clock = {}
  }

  increment(serverId) {

    if(this.clock[serverId]) {
      this.clock[serverId]++
    } else {
      this.clock[serverId] = 1
    }
    
  }
  
}

module.exports = {
  VectorClock
}