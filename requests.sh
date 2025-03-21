#!/bin/bash

# Base URL - Replace with your actual API Gateway URL
API_URL="https://d6n4hjsbi1.execute-api.us-east-1.amazonaws.com/dev"

# Your authentication token (after running npm run generate:token)
AUTH_TOKEN="eyJraWQiOiJhZnpzSEQrVTFsU3FXemR5TFVnajVyVWNSeWhOSHZwOGNYc1lMWEZuOURFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5NGI4ODQzOC02MDIxLTcwNDctMzI5MC1jMzhmMzYwNGNlZmQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX1ZLWDJ4RTJhSyIsImNvZ25pdG86dXNlcm5hbWUiOiI5NGI4ODQzOC02MDIxLTcwNDctMzI5MC1jMzhmMzYwNGNlZmQiLCJvcmlnaW5fanRpIjoiNmYxM2Y0ZmItNzc4Ny00ZDE5LThiZGQtMDRjNDk2ZjRiNTQ3IiwiYXVkIjoiNGR1OG5rb3Jyajkxb3M2NzN2OXJiZXQ3aTQiLCJldmVudF9pZCI6ImM5NzNkNWFiLWQxYzEtNDEwMC04OWViLWUxYzc3MzI2OTA1NyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzQyNTM3MDcxLCJleHAiOjE3NDI1NDA2NzAsImlhdCI6MTc0MjUzNzA3MSwianRpIjoiYTEzZGNiNmUtZjlmNi00ODA4LWJmMTEtZGMyODk4ZTExZTgzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.GGrD0e69XINhmOGJXuvZTJI2NEFF4RMjKNGxagbeGAELTQOo77MfHgS-mCYo5cohR3mPMtTq0DfcYzS_MnVsKuEyXre0JMHD6o8o99bIz8j4K9nzKclZxt0-xncHqLwheS0Yg25emdSQdHu2P672PYod6qx-7-8AsGyIDnMaTjMnEupxGqqjmmiKjD9-Vk5mfRwjMBIaYSHF9Rh2Bl3m6g6YfEVcJTu8wnIopB9MKw8R07y2wu9pSENgQEZQ8J6BZv32ureNrj2B79SKdACqCJWMACj8Ue0DURmFRxLmpEO10R5oI73n9xGZaDFtKQK5asR_IUzfBaI-sprU64A7sw"

# Public endpoint - Get random Star Wars planet weather
echo "Fetching random planet weather..."
curl --request GET \
  --url "${API_URL}/fusionados" \
  --header 'Content-Type: application/json'

echo -e "\n\n"

# Protected endpoint - Get weather history
echo "Fetching weather history..."
curl --request GET \
  --url "${API_URL}/historial" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${AUTH_TOKEN}"

echo -e "\n\n"

# Protected endpoint - Store custom data
echo "Storing custom data..."
curl --request POST \
  --url "${API_URL}/almacenar" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --data '{
    "customData": {
      "example": "Your custom data here"
    }
  }' 