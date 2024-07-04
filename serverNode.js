class ServerNode {

  constructor(serverDetails) {
    this.id = serverDetails.id
    this.name = serverDetails.name
    this.ip = serverDetails.ip
    this.data = {}
  }

  put(key, value) {
    this.data[ key ] = value
  }

  get(key) {
    return this.data[ key ]
  }

  getData() {
    return this.data
  }

}

module.exports = {
  ServerNode
}