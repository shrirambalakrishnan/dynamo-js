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
    server.put(key, value)

    this.relicateWrites(serverId, key, value)
  }

  relicateWrites(serverId, key, value) {
    const serverIdsToReplicate = this.fetchServerIdsForReplication(serverId)
    const serversToReplicate = this.servers.filter( server => serverIdsToReplicate.includes(server.id) )

    serversToReplicate.forEach( server => server.put(key, value) )
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