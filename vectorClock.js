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

  static compare(clock1, clock2) {

    let clock1IsBefore = false
    let clock2IsBefore = false

    // Loop through all the nodes in clock1 and compare each with clock2's corresponding node
    for(let node in clock1) {
      if(clock1[node] < (clock2[node] || 0)) {
        clock1IsBefore = true
      } else if(clock1[node] > (clock2[node] || 0)) {
        clock2IsBefore = true
      } 
    }

    for(let node in clock2) {
      if((clock1[node] || 0) < clock2[node]) {
        clock1IsBefore = true
      } else if((clock1[node] || 0) > clock2[node]) {
        clock2IsBefore = true
      } 
    }

    if(clock1IsBefore && clock2IsBefore) {
      return 0
    } else if( clock1IsBefore) {
      return -1
    } else if( clock2IsBefore) {
      return 1
    } 
    
  }
  
}

module.exports = {
  VectorClock
}