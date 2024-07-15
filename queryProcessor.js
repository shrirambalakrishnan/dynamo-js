// Process any query
// In case of write query, 
//  Replicate the data to (N+1)th node as well
//  This will later be driven by a config

class QueryProcessor {

  constructor(consistentHashing, servers) {
    this.consistentHashing = consistentHashing
    this.servers = servers
  }

  get(key) {

  }

  put(key, value) {
    const serverId = this.consistentHashing.getServer( key )
    const server = this.servers.find( server => server.id == serverId )

    // While writing to primary node, increment vector clock
    server.clock.increment(server.id)
    const valueWithContext = {value, vectorClock: JSON.parse(JSON.stringify(server.clock))}
    server.put(key, valueWithContext)

    this.relicateWrites(serverId, key, valueWithContext)
  }

  relicateWrites(serverId, key, valueWithContext) {
    const serverIdsToReplicate = this.fetchServerIdsForReplication(serverId)
    const serversToReplicate = this.servers.filter( server => serverIdsToReplicate.includes(server.id) )

    serversToReplicate.forEach( server => {
      // While writing to replication nodes, retain the vector clock information passed by the primary node
      server.put(key, valueWithContext) 
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