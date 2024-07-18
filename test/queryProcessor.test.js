const { QueryProcessor } = require("../queryProcessor")
const sinon = require("sinon")
const { expect } = require("chai")
const { VectorClock } = require("../vectorClock")

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
    this.get = sinon.stub()
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

  describe("#get", function() {
    let response, primaryServer, replicationServer, nonReplicationServer
    
    this.beforeEach( function() {
      queryProcessor.resolveConflictsAndGetValidVersion = sinon.stub().returns({value: "hello"})
      response = queryProcessor.get("key1")
      primaryServer = servers.find(server => server.id == "server-1")
      replicationServer = servers.find(server => server.id == "server-3")
      nonReplicationServer = servers.find(server => server.id == "server-2")
    })

    this.afterEach( function() {
      sinon.restore()
    })
    
    it("fetches data from primary and replication servers", function() {
      expect( primaryServer.get.called ).to.be.true
      expect( replicationServer.get.called ).to.be.true
    })

    it("does not fetche data from non-replication servers", function() {
      expect( nonReplicationServer.get.called ).to.be.false
    })

    it("resolves conflicts and returns the last written data", function() {
      expect( queryProcessor.resolveConflictsAndGetValidVersion.called ).to.be.true
      expect( response ).to.deep.equal( "hello" )
    })  
  })

  describe("resolveConflictsAndGetValidVersion", function() {
    let olderResponse, oldResponse, latestResponse, sandbox

    beforeEach( function() {
      olderResponse =   { vectorClock: { "1": 1 } },
      oldResponse =     { vectorClock: { "1": 2 } },
      latestResponse =  { vectorClock: { "1": 10 } }
      sandbox = sinon.createSandbox()
    })

    afterEach( function() {
      sandbox.restore()
    })

    it("calls Vector.clock to compare clocks of responses", function() {
      let allResponses = [olderResponse, oldResponse, latestResponse]
      const vectorClockCompareStub = sandbox.stub(VectorClock, "compare")
      queryProcessor.resolveConflictsAndGetValidVersion(allResponses)

      expect(vectorClockCompareStub.called).to.be.true
    })
    
    it("returns latestResponse from the list of responses", function() {
      let allResponses = [olderResponse, oldResponse, latestResponse]
      const vectorClockCompareStub = sandbox.stub(VectorClock, "compare").returns(-1)
      const response = queryProcessor.resolveConflictsAndGetValidVersion(allResponses)

      expect(response).to.deep.equal(latestResponse)
    })

    it("returns latestResponse from the list of responses - case 2", function() {
      let allResponses = [latestResponse, oldResponse, olderResponse]
      const vectorClockCompareStub = sandbox.stub(VectorClock, "compare").returns(1)
      const response = queryProcessor.resolveConflictsAndGetValidVersion(allResponses)

      expect(response).to.deep.equal(latestResponse)
    })

    it("if clocks are incomparable , return one", function() {
      let allResponses = [olderResponse, oldResponse, latestResponse]
      const vectorClockCompareStub = sandbox.stub(VectorClock, "compare").returns(0)
      const response = queryProcessor.resolveConflictsAndGetValidVersion(allResponses)

      expect(response).to.deep.equal(olderResponse)
    })
  })
})