import { IRequest, RequestOptions, ResponseType } from "./types";

// Fetch实现
export class FetchRequest extends IRequest {
    async request<T>(url: string, options: RequestOptions = {}): Promise<ResponseType<T>> {
      const controller = new AbortController();
      if (options.timeout) {
        setTimeout(() => controller.abort(), options.timeout);
      }
  
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
  
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });
  
      return {
        data: await response.json(),
        status: response.status,
        statusText: response.statusText,
        headers,
        rawResponse: response,
      };
    }
  
    get<T>(url: string, options?: RequestOptions): Promise<ResponseType<T>> {
      return this.request(url, { ...options, method: 'GET' });
    }
  
    post<T>(url: string, data?: any, options?: RequestOptions): Promise<ResponseType<T>> {
      return this.request(url, { ...options, method: 'POST', body: data });
    }
  }