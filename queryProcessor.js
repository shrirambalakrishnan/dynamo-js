// Process any query
// In case of write query, 
//  Replicate the data to (N+1)th node as well
//  This will later be driven by a config

class QueryProcessor {

  constructor(consistentHashing, servers, vectorClock) {
    this.consistentHashing = consistentHashing
    this.servers = servers
    this.vectorClock = vectorClock
  }

  get(key) {

  }

  put(key, value) {
    const serverId = this.consistentHashing.getServer( key )
    const server = this.servers.find( server => server.id == serverId )

    this.vectorClock.increment(server.id)
    server.put(key, {value, vectorClock: this.vectorClock.clock[server.id]})

    this.relicateWrites(serverId, key, value)
  }

  relicateWrites(serverId, key, value) {
    const serverIdsToReplicate = this.fetchServerIdsForReplication(serverId)
    const serversToReplicate = this.servers.filter( server => serverIdsToReplicate.includes(server.id) )

    serversToReplicate.forEach( server => {
      this.vectorClock.increment(server.id)
      server.put(key, {value, vectorClock: this.vectorClock.clock[server.id]}) 
    })
  }

  fetchServerIdsForReplication(serverId) {
    return [
      this.consistentHashing.getNextServerInRing(serverId)
    ]
  }
  
}

module.exports = {
  QueryProcessor
}