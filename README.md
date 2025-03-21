# Star Wars Weather API

This project is a serverless API that provides weather information for Star Wars planets, built using AWS Lambda and the Serverless Framework. It includes features like simulated weather information from planets, historical weather data, and secure data storage.

## Features

- Get weather information for random Star Wars planets
- Store and retrieve weather history
- Secure endpoints with Cognito authentication
- API documentation with Swagger
- DynamoDB for data persistence
- Request caching system
- Advanced logging with CloudWatch
- Request tracing with X-Ray

## Technical Challenge Checklist

### Core Requirements

- [x] Node.js v20 with Serverless Framework/CDK
- [x] TypeScript implementation
- [x] AWS Lambda deployment
- [x] DynamoDB for data storage
- [x] API Gateway integration

### API Integration

- [x] Star Wars API (SWAPI) integration
- [x] Weather API integration
- [x] Data fusion between both APIs
- [x] Data normalization (types, units)

### Endpoints

- [x] GET /fusionados - Combined data from both APIs
- [x] POST /almacenar - Store custom data
- [x] GET /historial - Retrieve stored history

### Data Management

- [x] DynamoDB tables setup
- [x] Response caching (30-minute interval)
- [x] Data normalization processing
- [x] Chronological history storage

### Security & Authentication

- [x] Cognito User Pool configuration
- [x] Protected endpoints (POST and GET /historial)
- [x] JWT token implementation

### Testing

- [x] Jest unit tests
- [x] Integration tests
- [x] TypeScript type safety

### Documentation

- [x] Swagger/OpenAPI documentation
- [x] API endpoint documentation
- [x] Environment setup guide

### AWS Optimizations

- [x] Lambda cost optimization
- [x] Memory/timeout configuration
- [x] CloudWatch logging
- [x] X-Ray tracing

### Bonus Features

- [x] AWS Cognito authentication
- [x] Swagger/OpenAPI documentation
- [x] Advanced logging with CloudWatch
- [ ] Rate limiting for external APIs
- [x] AWS X-Ray monitoring
- [ ] Gherkin BDD tests

## Prerequisites

- Node.js 20.x
- AWS Account and AWS CLI
- Serverless Framework CLI installed (`npm install -g serverless`)
- Weather API key (set as environment variable)

## Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nodejs-aws-challenge
   ```

2. **Configure AWS CLI**

   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your preferred region (e.g., us-east-1)
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Environment Setup**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Fill in the required environment variables:
     - `WEATHER_API_KEY`: Your weather API key
     - `AWS_REGION`: Your AWS region (e.g., us-east-1)
     - Other variables will be available after deployment

## Environment Variables

Create a `.env` file with the following variables:

```bash
WEATHER_API_KEY=your_weather_api_key
AWS_REGION=your_aws_region
COGNITO_USER_POOL_CLIENT_ID=your_cognito_client_id
TEST_USER_EMAIL=your_test_user_email
TEST_USER_PASSWORD=your_test_user_password
```

## Deployment

1. **Deploy the service**

   ```bash
   serverless deploy
   ```

2. **Post-deployment setup**
   After successful deployment, you'll receive:

   - API Gateway endpoint URL
   - Cognito User Pool ID
   - Cognito Client ID

   Update your `.env` file with:

   - `COGNITO_USER_POOL_CLIENT_ID` from the deployment output

3. **Create a test user**

   ```bash
   aws cognito-idp sign-up \
     --client-id YOUR_COGNITO_CLIENT_ID \
     --username your-email@example.com \
     --password your-password \
     --user-attributes Name=email,Value=your-email@example.com

   aws cognito-idp admin-confirm-sign-up \
     --user-pool-id YOUR_USER_POOL_ID \
     --username your-email@example.com
   ```

4. **Update environment variables**
   Add to your `.env` file:
   ```bash
   TEST_USER_EMAIL=your-email@example.com
   TEST_USER_PASSWORD=your-password
   ```

## Authentication

To generate an authentication token for protected endpoints:

1. Make sure you have set up your environment variables correctly
2. Run the token generation script:

```bash
npm run generate:token
```

This will output your authentication tokens. Use the ID token in your API requests:

```bash
Authorization: Bearer <your_id_token>
```

## API Endpoints

### Public Endpoints

- GET `/fusionados` - Get weather for a random Star Wars planet with Earth comparison

### Protected Endpoints (Requires Authentication)

- GET `/historial` - Retrieve weather history records
- POST `/almacenar` - Store custom JSON data

## Local Development

Run the service locally:

```bash
serverless offline
```

## Testing

Run tests:

```bash
npm test               # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Documentation

API documentation is available at `/api-docs` when the service is running.

## API Examples

Example API requests are available in the `requests.sh` file. To use it:

1. Update the `API_URL` variable with your actual API Gateway URL
2. Generate an authentication token using `npm run generate:token`
3. Update the `AUTH_TOKEN` variable with your generated token
4. Make the script executable and run it:

```bash
chmod +x requests.sh
./requests.sh
```

You can also run individual commands from the file manually.
