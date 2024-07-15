const { QueryProcessor } = require("../queryProcessor")
const sinon = require("sinon")
const { expect } = require("chai")

class MockConsistentHashing {
  getServer(key) {
    return "server-1"
  }

  getNextServerInRing(serverId) {
    return "server-3"
  }
}

class MockVectorClock {
  constructor() {
    this.clock = {
      "server-1": 10,
      "server-2": 50,
      "server-3": 25,
    }
    this.increment = sinon.stub()
  }
}

class MockServer {
  constructor(id) {
    this.id = id
    this.put = sinon.stub()
    this.clock = new MockVectorClock()
  }
}

describe("QueryProcessor", function() {
  let consistentHashing, servers, queryProcessor, mockVectorClock

  this.beforeEach( function() {
    consistentHashing = new MockConsistentHashing()
    servers = [
      new MockServer("server-1"),
      new MockServer("server-2"),
      new MockServer("server-3")
    ]
    queryProcessor = new QueryProcessor(consistentHashing, servers)
  })

  this.afterEach( function() {
    sinon.restore();
  })

  describe("#put", function() {
    
    it("writes data to the primary server", function() {
      queryProcessor.put("key1", "value1")
      let primaryServer = servers.find(server => server.id == "server-1")
      let putCallArgs = primaryServer.put.getCall(0).args

      expect( primaryServer.put.called ).to.be.true
      expect( putCallArgs[0] ).to.equal( "key1" )
      expect( putCallArgs[1] ).to.deep.equal( {
        value: "value1", 
        vectorClock: {
          clock: {
            "server-1": 10,
            "server-2": 50,
            "server-3": 25,
          }
        } 
      })
    })

    it("writes data to the replication servers", function() {
      queryProcessor.put("key1", "value1")
      let replicationServer = servers.find(server => server.id == "server-3")
      let putCallArgs = replicationServer.put.getCall(0).args

      expect( replicationServer.put.called ).to.be.true
      expect( putCallArgs[0] ).to.equal( "key1" )
      expect( putCallArgs[1] ).to.deep.equal( {
        value: "value1", 
        vectorClock: {
          clock: {
            "server-1": 10,
            "server-2": 50,
            "server-3": 25,
          }
        }
      })
    })

    it("does not write data to the non-replication servers", function() {
      queryProcessor.put("key1", "value1")
      let replicationServer = servers.find(server => server.id == "server-2")
      expect( replicationServer.put.called ).to.be.false
    })
    
  })
  
})