export type ApiReponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | unknown;
}
