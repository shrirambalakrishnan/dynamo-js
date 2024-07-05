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

class MockServer {
  constructor(id) {
    this.id = id
    this.put = sinon.stub()
  }
}

describe("QueryProcessor", function() {
  let consistentHashing, servers, queryProcessor

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
      expect( primaryServer.put.calledOnceWith("key1", "value1") ).to.be.true
    })

    it("writes data to the replication servers", function() {
      queryProcessor.put("key1", "value1")
      let replicationServer = servers.find(server => server.id == "server-3")
      expect( replicationServer.put.calledOnceWith("key1", "value1") ).to.be.true
    })

    it("does not write data to the non-replication servers", function() {
      queryProcessor.put("key1", "value1")
      let replicationServer = servers.find(server => server.id == "server-2")
      expect( replicationServer.put.called ).to.be.false
    })
    
  })
  
})