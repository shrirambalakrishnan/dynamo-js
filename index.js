const { ConsistentHashing } = require("./consistenHashing");
const { ServerNode } = require("./serverNode");
const { QueryProcessor } = require("./queryProcessor")
const { VectorClock } = require("./vectorClock")

function initServers() {
  let serverNode1 = new ServerNode({ id: 1, name: "server1", ip: "server1-ip" })
  let serverNode2 = new ServerNode({ id: 2, name: "server2", ip: "server2-ip" })
  let serverNode3 = new ServerNode({ id: 3, name: "server3", ip: "server3-ip" })
  let serverNode4 = new ServerNode({ id: 4, name: "server4", ip: "server4-ip" })

  let servers = [
    serverNode1,
    serverNode2,
    serverNode3,
    serverNode4,
  ]

  return servers
}

function seedData() {
  let dataToStore = [
    { key: "A001", value: {name: "user1", id: 1, address: "user1-address"} },
    { key: "A002", value: {name: "user2", id: 2, address: "user2-address"} },
    { key: "B003", value: {name: "user3", id: 3, address: "user3-address"} },
    { key: "C004", value: {name: "user4", id: 4, address: "user4-address"} },
    { key: "D005", value: {name: "user5", id: 5, address: "user5-address"} },
    { key: "0006", value: {name: "user6", id: 6, address: "user6-address"} },
  ]

  return dataToStore
}

function loadData(servers, consistenHashing, dataToStore, vectorClock) {

  dataToStore.forEach( data => {
    const queryProcessor = new QueryProcessor(consistenHashing, servers, vectorClock)
    queryProcessor.put(data.key, data.value)
  })
  
}

function printServersData(servers) {
  servers.forEach( server => {
    console.log("-----------------------------------")
    console.log("server = ", server.id)
    console.log("data stored count = ", JSON.stringify(Object.keys(server.data).length))
    console.log("server clock = ", server.clock)
    console.log("data stored = ", JSON.stringify(server.data))
  })
}

function startSimulation() {
  let servers = initServers()
  let dataToStore = seedData()

  let consistenHashing = new ConsistentHashing( servers )
  consistenHashing.constructRing()

  loadData(servers, consistenHashing, dataToStore)
  printServersData(servers)
}

function main() {
  startSimulation()
}

main()