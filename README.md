# web-code-test-server
Server for the frontend web dev code test in our interview process.

PS: Please forgive my JavaScript!

## API endpoints:
```
# Obtain an access token
curl -H "Content-Type: application/json" -X POST -d '{"email":"mondo@example.com","password":"hunter"}' http://localhost:3000/login

# Test whether or not your access token is valid
curl -H "Authorization: $token" http://localhost:3000/

# List your oAuthClients
curl -H "Authorization: $token" http://localhost:3000/oAuthClients

# List all users for a given oAuth client with id $client_id
curl -H "Authorization: $token" http://localhost:3000/oAuthClients/$client_id/users"?limit=25&offset=0

# Update a given oAuth client
curl -H "Authorization: $token" -H "Content-Type: application/json" -X PUT -d '{"name":"New name"}' http://localhost:3000/oAuthClients/$client_id
```
