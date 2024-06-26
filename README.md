# dynamo-js

- Based on the paper "Dynamo: Amazon’s Highly Available Key-value Store"
- Implementation using NodeJS
- Components to build (high level)
  - Consistent Hashing
    - To determine the node to store the key
  - Implement reads and writes
    - Ensure consistency using quoram based protocol
  - Implement data replication
  - Handle node failures
    - Transient failures
    - Permanent failures
  - Conflict resolution