export enum ToolType {
  JSON = 'JSON',
  BASE64 = 'BASE64',
  UUID = 'UUID',
  JWT = 'JWT',
  WEBP = 'WEBP'
}

export interface JsonAnalysisResult {
  summary: string;
  tsInterface: string;
}

export interface JwtHeader {
  alg?: string;
  typ?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface DecodedJwt {
  header: JwtHeader | null;
  payload: JwtPayload | null;
  signature: string | null;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}