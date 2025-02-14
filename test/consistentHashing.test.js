const assert = require("assert")
const md5 = require('md5');

const { ConsistentHashing } = require("../consistenHashing")

describe("ConsistentHashing", function() {

  describe("#constructRing", function() {

    it("constructs ring with hashed value of each server index", function() {

      const servers = [
        { id: 100, name: "server100", ip: "server100-ip"},
        { id: 1, name: "server1", ip: "server1-ip"},
        { id: 300, name: "server300", ip: "server300-ip"},
        { id: 200, name: "server200", ip: "server200-ip"},
        { id: 50, name: "server50", ip: "server50-ip"},
        { id: 190, name: "server190", ip: "server190-ip"},
        { id: 210, name: "server210", ip: "server210-ip"},
      ]

      const consistentHashing = new ConsistentHashing(servers)
      consistentHashing.constructRing()
      
      const expectedRing = [
        md5( 100 ),
        md5( 1 ),
        md5( 300 ),
        md5( 200 ),
        md5( 50 ),
        md5( 190 ),
        md5( 210 ),
      ].sort()

      assert.deepEqual(
        consistentHashing.getRing(),
        expectedRing
      )
    })
  })

  describe("#getServer", function() {

    describe("when there are no servers in ring", function() {
      it("returns null when there are no servers", function() {
        const servers = []
        const consistentHashing = new ConsistentHashing(servers)
        consistentHashing.constructRing()
  
        assert.deepEqual(
          consistentHashing.getServer("450"),
          null
        )
      })
    })
    
    describe("when there are servers available in the ring", function() {
      let servers, consistentHashing
      
      this.beforeEach( function() {
        servers = [
          { id: 200, name: "server200", ip: "server200-ip"},
          { id: 100, name: "server100", ip: "server100-ip"},
          { id: 300, name: "server300", ip: "server300-ip"},
        ]

        consistentHashing = new ConsistentHashing(servers)
        consistentHashing.constructRing()
      })
      
      it("returns a valid server - case 1", function() {
        const selectedServerIndex = consistentHashing.getServer(50)
        const isAnyOneServerSelected = servers.map( server => server.id ).includes( selectedServerIndex )
        assert( isAnyOneServerSelected, true )
      })
  
      it("returns a valid server - case 2", function() {
        const selectedServerIndex = consistentHashing.getServer(250)
        const isAnyOneServerSelected = servers.map( server => server.id ).includes( selectedServerIndex )
        assert( isAnyOneServerSelected, true )
      })
  
      it("returns a valid server - case 2", function() {
        const selectedServerIndex = consistentHashing.getServer(4000)
        const isAnyOneServerSelected = servers.map( server => server.id ).includes( selectedServerIndex )
        assert( isAnyOneServerSelected, true )
      })
      
    })
    
    
  })

  describe("#addServer", function() {

    it("adds new server into the ring", function() {
      let servers = [
        { id: 200, name: "server200", ip: "server200-ip"},
        { id: 100, name: "server100", ip: "server100-ip"},
        { id: 300, name: "server300", ip: "server300-ip"},
      ]

      let consistentHashing = new ConsistentHashing(servers)
      consistentHashing.constructRing()

      let newServer = {id: 50, name: "server0", ip: "server0-ip"}
      consistentHashing.addServer(newServer)
      
      let updatedRing = consistentHashing.getRing()
      assert.equal(updatedRing.length, 4)
    })
    
  })

  describe("#removeServer", function() {
    let servers, consistentHashing

    beforeEach( function() {
      servers = [
        { id: 200, name: "server200", ip: "server200-ip"},
        { id: 100, name: "server100", ip: "server100-ip"},
        { id: 300, name: "server300", ip: "server300-ip"},
      ]

      consistentHashing = new ConsistentHashing(servers)
      consistentHashing.constructRing()
    })

    it("returns null if server to remove is not available in the ring", function() {
      let serverToDelete =  { id: 1200, name: "server1200", ip: "server1200-ip"}
      let removeServerResponse = consistentHashing.removeServer(serverToDelete)
      assert.equal(removeServerResponse, null)
      
      let updatedRing = consistentHashing.getRing()
      assert.equal(updatedRing.length, 3)
    })
    
    it("removes server from the ring", function() {
      let serverToDelete = servers[0]
      consistentHashing.removeServer(serverToDelete)
      
      let updatedRing = consistentHashing.getRing()
      assert.equal(updatedRing.length, 2)
    })
    
  })

  describe("#getNextServerInRing", function() {
    describe("when there are servers available in the ring", function() {
      let servers, consistentHashing
      
      this.beforeEach( function() {
        servers = [
          { id: 200, name: "server200", ip: "server200-ip"},
          { id: 100, name: "server100", ip: "server100-ip"},
          { id: 300, name: "server300", ip: "server300-ip"},
        ]

        consistentHashing = new ConsistentHashing(servers)
        consistentHashing.constructRing()
      })

      it("returns the next server in the ring", function() {

        let serverIdSelected = 100
        let hashserverIdSelected = consistentHashing.generateHash(serverIdSelected)
        let serverIndexinRing = consistentHashing.ring.findIndex( serverInRing => serverInRing == hashserverIdSelected)

        assert.equal(
          consistentHashing.getNextServerInRing( serverIndexinRing ),
          200
        )
        
      })

      it("returns the first server in the ring if the selected server is the last one", function() {

        let serverIdSelected = 300
        let hashserverIdSelected = consistentHashing.generateHash(serverIdSelected)
        let serverIndexinRing = consistentHashing.ring.findIndex( serverInRing => serverInRing == hashserverIdSelected)

        assert.equal(
          consistentHashing.getNextServerInRing( serverIndexinRing ),
          100
        )
        
      })
    })
  })
})