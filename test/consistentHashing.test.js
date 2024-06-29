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
})