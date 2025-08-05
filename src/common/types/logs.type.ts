export type Logs = {
  method: string;
  url: string;
  params: unknown;
  body: unknown;
  executionTime: string;
  statusCode: number;
  error?: {
    errorMessage: string;
    errorName?: string;
  };
};
