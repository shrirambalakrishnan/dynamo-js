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

      this.hashValueToServerMapping[serverHashValue] = server.id
    })
    
    // Each server has to be placed in IT'S OWN position in the ring
    // Only then the clockwise navigation to find the correct server would work
    // Hence, afer hash generation for each server, sort it to create a ring
    this.ring.sort()

    console.info("ConsistentHashing.constructRing.2 this.ring = ", JSON.stringify(this.ring))
  }

  getServer(key) {
    console.debug("ConsistentHashing.getServer.0 key = ", key)

    if(this.ring.length == 0) {
      return
    }

    const keyHashValue = this.generateHash( key )
    let selectedServerHashValue = null,
        selectedServer = null;
    
    for(let i = 1; i < this.ring.length && selectedServerHashValue == null ; i++) {
      if( keyHashValue < this.ring[i] ) {
        selectedServerHashValue = this.ring[i] 
      }
    }

    if( !selectedServerHashValue ) {
      selectedServerHashValue = this.ring[0]
    }

    selectedServer = this.hashValueToServerMapping[ selectedServerHashValue ]
    console.info("ConsistentHashing.getServer.0 selectedServerHashValue, selectedServer = ", selectedServerHashValue, selectedServer)

    return selectedServer
  }

  getNextServerInRing(serverIndex) {
    const nextServerIndex = (serverIndex + 1) % this.ring.length
    const nextServerHashValue = this.ring[nextServerIndex]
    const nextServerId = this.hashValueToServerMapping[ nextServerHashValue ]

    return nextServerId
  }

  addServer(server) {
    const newServerHashValue = this.generateHash(server.id)
    console.log("ConsistentHashing.addServer newServerHashValue = ", newServerHashValue)
    
    let indexToInsertNewServer
    for(let i=0;i<this.ring.length && !indexToInsertNewServer;i++) {
      if( this.ring[i] > newServerHashValue ) {
        indexToInsertNewServer = i
      }
    }

    if(indexToInsertNewServer < 0) {
      indexToInsertNewServer = 0
    } 
    
    console.log("ConsistentHashing.addServer indexToInsertNewServer = ", indexToInsertNewServer)
    this.ring.splice(indexToInsertNewServer, 0, newServerHashValue)

    this.hashValueToServerMapping[ newServerHashValue ] = server.id
    
    console.log("ConsistentHashing.addServer updated ring = ", JSON.stringify(this.ring))
  }

  removeServer(server) {
    const serverHashValue = this.generateHash(server.id)
    console.debug("ConsistentHashing.addServer serverHashValue = ", serverHashValue)

    let indexOfServerToRemove = this.ring.findIndex(server => server == serverHashValue)

    if(indexOfServerToRemove < 0) {
      return
    }
    
    this.ring.splice(indexOfServerToRemove, 1)
    delete this.ring[serverHashValue]

    console.log("ConsistentHashing.removeServer updated ring = ", JSON.stringify(this.ring))
  }
}

module.exports = {
  ConsistentHashing
}
