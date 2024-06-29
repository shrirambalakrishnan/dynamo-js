const assert = require("assert")
const { ServerNode } = require("../serverNode")

describe("ServerNode", function() {
  
  describe("#put", function() {
    it("stores incoming data in the `data` attribute", function() {
      const nodeDetails = { id: 1, name: "server1", ip: "server1-ip" }
      let serverNode = new ServerNode(nodeDetails)
      serverNode.put(201, {name: "user1", id: 1, address: "user1-address"})

      assert.deepEqual(
        serverNode.data[ 201 ],
        {name: "user1", id: 1, address: "user1-address"}
      )
    })
  })

  describe("#get", function() {
    it("fetches data for a given key", function() {
      const nodeDetails = { id: 1, name: "server1", ip: "server1-ip" }
      let serverNode = new ServerNode(nodeDetails)
      serverNode.put(201, {name: "user1", id: 1, address: "user1-address"})

      assert.deepEqual(
        serverNode.get( 201 ),
        {name: "user1", id: 1, address: "user1-address"}
      )
    })
  })

  describe("#getData", function() {
    it("fetches data property of the server object", function() {

      const nodeDetails = { id: 1, name: "server1", ip: "server1-ip" }
      let serverNode = new ServerNode(nodeDetails)
      serverNode.put(201, {name: "user1", id: 1, address: "user1-address"})
      serverNode.put(202, {name: "user2", id: 2, address: "user2-address"})
      serverNode.put(203, {name: "user3", id: 3, address: "user3-address"})

      assert.deepEqual(
        serverNode.getData(),
        {
          201: {name: "user1", id: 1, address: "user1-address"},
          202: {name: "user2", id: 2, address: "user2-address"},
          203: {name: "user3", id: 3, address: "user3-address"},
        }
      )
    })
  })
  
})