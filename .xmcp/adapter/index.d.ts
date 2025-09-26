
export const xmcpHandler: (req: Request) => Promise<Response>;
export const withAuth: (handler: (req: Request) => Promise<Response>, authConfig: AuthConfig) => (req: Request) => Promise<Response>;
export type VerifyToken = (req: Request, bearerToken?: string) => Promise<AuthInfo | undefined>;
export type Options = {
  required?: boolean;
  requiredScopes?: string[];
  resourceMetadataPath?: string;
};
export type AuthConfig = {
  verifyToken: VerifyToken;
  options?: Options;
};
export type AuthInfo = {
  token: string;
  clientId: string;
  scopes: string[];
  expiresAt?: number;
  resource?: URL;
  extra?: Record<string, unknown>;
};
