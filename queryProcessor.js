const { VectorClock } = require("./vectorClock")

class QueryProcessor {

  constructor(consistentHashing, servers, vectorClock) {
    this.consistentHashing = consistentHashing
    this.servers = servers
  }

  get(key) {
    // Quorum based READ
    // Get the data from all the servers
    // Compare, resolve conflict and return a valid version of data

    const primaryServerId = this.consistentHashing.getServer( key )
    const primaryServer = this.servers.find( server => server.id == primaryServerId )

    const replicationServerIds = this.fetchServerIdsForReplication(primaryServerId)
    const replicationServers = this.servers.filter( server => replicationServerIds.includes(server.id) )

    const serversToReadData = [ primaryServer, ...replicationServers]
    const readResponses = serversToReadData.map( server => server.get(key) )
    console.log("QueryProcessor.get - readResponses = ", JSON.stringify(readResponses))

    const readResponse = this.resolveConflictsAndGetValidVersion(readResponses)
    console.log("QueryProcessor.get - key = ", JSON.stringify(readResponse))

    return readResponse.value
  }

  resolveConflictsAndGetValidVersion(allResponses) {

    // If conflict can be resolved using the vectorclocks, then resolve and obtained the correct version
    // Else send the latest version (taking the "resolve at the backend" route here)

    let latestResponse = allResponses[0]

    for(let i = 1;i < allResponses.length; i++ ) {
      let currentResponse = allResponses[i]
      const vectorClockCompareResult = VectorClock.compare(latestResponse.vectorClock, currentResponse.vectorClock)

      if( vectorClockCompareResult == -1) {
        // latestResponse has happened BEFORE currentResponse
        // Hence update the latestResponse
        latestResponse = currentResponse

      } else if( vectorClockCompareResult == 1 ) {
        // latestResponse is already the latest
        // do nothing

      } else if( vectorClockCompareResult == 0 ) {
        // This means that concurrent WRITEs have happened
        // We can either send all the conflicting version to application OR respond with the latest WRITE
        // In this case, we will choose to do nothing and just continue the loop
        
      }
    }
    
    return latestResponse
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

  //  Replicate the data to (N+1)th node as well
  //  This will later be driven by a config
  fetchServerIdsForReplication(serverId) {
    return [
      this.consistentHashing.getNextServerInRing(serverId)
    ]
  }
  
}

module.exports = {
  QueryProcessor
}