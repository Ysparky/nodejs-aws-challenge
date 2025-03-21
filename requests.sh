#!/bin/bash

# Base URL - Replace with your actual API Gateway URL
API_URL="https://d6n4hjsbi1.execute-api.us-east-1.amazonaws.com/dev"

# Your authentication token (after running npm run generate:token)
AUTH_TOKEN="YOUR_TOKEN_HERE"

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