export interface ApiErrorDto {
  statusCode: number;
  error: string;
  message: string | string[];
}
