# dynamo-js

- Implemented a basic distributed storage in NodeJS based on the whitepaper "Dynamo: Amazon’s Highly Available Key-value Store"
- Features
  - Consistent Hashing
  - Data replication
  - "writes" with version using Vector Clocks
  - "reads" using quoram based protocol