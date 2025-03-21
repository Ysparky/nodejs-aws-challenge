import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import * as dotenv from "dotenv";

dotenv.config();

const generateToken = async (email: string, password: string) => {
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || "us-east-1",
  });

  if (!process.env.COGNITO_USER_POOL_CLIENT_ID) {
    throw new Error("COGNITO_USER_POOL_CLIENT_ID is not set in .env file");
  }

  const params: InitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);

    return {
      accessToken: response.AuthenticationResult?.AccessToken,
      idToken: response.AuthenticationResult?.IdToken,
      refreshToken: response.AuthenticationResult?.RefreshToken,
      expiresIn: response.AuthenticationResult?.ExpiresIn,
    };
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

if (require.main === module) {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.error(
      "Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in your .env file"
    );
    process.exit(1);
  }

  generateToken(email, password)
    .then((tokens) => {
      console.log("\nGenerated Tokens:\n");
      console.log(JSON.stringify(tokens, null, 2));
      console.log("\nUse the idToken in the Authorization header:\n");
      console.log(tokens.idToken);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export default generateToken;
