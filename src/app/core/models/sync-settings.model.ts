export interface SyncSettings {
  authentication?: SyncAuth;
  url: string;
  updateMethod: 'PUT' | 'PATCH' | 'POST';
}

type BasicAuth = string; // base64 encoded string

interface TokenAuth {
  token: string;
  location: 'query' | 'header';
  queryParam?: string;
}

export type SyncAuth = BasicAuth | TokenAuth;

export const isSyncTokenAuth = (auth: SyncAuth): auth is TokenAuth => {
  return (auth as TokenAuth).token !== undefined && (auth as TokenAuth).location !== undefined;
};
