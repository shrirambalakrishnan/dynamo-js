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
    
  }

  getRing() {
    return this.ring
  }

  generateHash(value) {
    return md5(value)
  }

  constructRing() {
    this.servers.forEach( (server, index) => {
      this.ring[index] = this.generateHash(server.id)
    })
    
    console.log("ConsistentHashing.constructRing this.ring = ", JSON.stringify(this.ring))
  }
  
}

module.exports = {
  ConsistentHashing
}