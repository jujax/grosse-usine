#!/bin/bash
echo "Initializing replica set..."
mongosh <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
});
EOF
echo "Replica set initialized."
