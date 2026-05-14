export interface ResponseErrorApi {
  message: string;
  success: boolean;
  errors: Record<string, string[]>
}