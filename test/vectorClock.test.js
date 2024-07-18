const { VectorClock } = require("../vectorClock")
const { expect } = require("chai")

describe("VectorClock", function() {

  describe("#compare", function() {

    it("returns -1 if all nodes of clock1 is before clock2", function() {
      const clock1 = { "A": 1, "B": 0, "C": 4}
      const clock2 = { "A": 1, "B": 1, "C": 5}
      let response = VectorClock.compare(clock1, clock2)
      
      expect(response).to.equal(-1)
    })

    it("returns +1 if all nodes of clock2 is before clock1", function() {
      const clock1 = { "A": 1, "B": 1, "C": 5}
      const clock2 = { "A": 1, "B": 0, "C": 4}
      let response = VectorClock.compare(clock1, clock2)
      
      expect(response).to.equal(1)
    })
    it("returns 0 if the some are lesser and some are greater", function() {
      const clock1 = { "A": 1, "B": 1, "C": 5}
      const clock2 = { "A": 1, "B": 6, "C": 4}
      let response = VectorClock.compare(clock1, clock2)
      
      expect(response).to.equal(0)
    })

    it("returns 0 if the some of the nodes are not present in other", function() {
      const clock1 = { "A": 1, "B": 1, "C": 5}
      const clock2 = { "A": 1, "B": 1, "C": 4, "E": 3}
      let response = VectorClock.compare(clock1, clock2)
      
      expect(response).to.equal(0)
    })
  })
  
})