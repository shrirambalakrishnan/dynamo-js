const assert = require("assert")
const md5 = require('md5');

const { ConsistentHashing } = require("../consistenHashing")

describe("ConsistentHashing", function() {

  describe("#constructRing", function() {

    it("constructs ring with hashed value of each server index", function() {

      const servers = [
        { id: 100, name: "server100", ip: "server100-ip"},
        { id: 200, name: "server200", ip: "server200-ip"},
        { id: 300, name: "server300", ip: "server300-ip"},
      ]

      const consistentHashing = new ConsistentHashing(servers)
      consistentHashing.constructRing()
      
      const expectedRing = [
        md5( servers[0].id ),
        md5( servers[1].id ),
        md5( servers[2].id )
      ]

      assert.deepEqual(
        consistentHashing.getRing(),
        expectedRing
      )
    })
  })
})