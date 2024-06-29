//// Todo

//// First iteration
// Select a hash function
// Set N (numberOfServers) to some value, say 4.
// Find the hash value of these server indexes
//    These will form the points in the ring
// For any key, 
//    hash this key
//    find the server whose hash value is greater than the key's hash value
//    assign this key to the server

//// Second iteration
// Handle the scenarios for
//    Adding a new server
//    Removing a server

const md5 = require('md5');

class ConsistentHashing {
  
  constructor(servers) {
    
    this.servers = servers
    this.ring = []
    this.hashValueToServerMapping = {}
    
  }

  getRing() {
    return this.ring
  }

  generateHash(value) {
    return md5(value)
  }

  constructRing() {
    this.servers.forEach( (server) => {
      const serverHashValue = this.generateHash(server.id)
      this.ring.push( serverHashValue )

      this.hashValueToServerMapping["serverHashValue"] = server.id
    })

    console.debug("ConsistentHashing.constructRing.1 this.ring = ", JSON.stringify(this.ring))
    
    // Each server has to be placed in IT'S OWN position in the ring
    // Only then the clockwise navigation to find the correct server would work
    // Hence, afer hash generation for each server, sort it to create a ring
    this.ring.sort()

    console.debug("ConsistentHashing.constructRing.2 this.ring = ", JSON.stringify(this.ring))
  }
  
}

module.exports = {
  ConsistentHashing
}