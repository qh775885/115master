export interface RequestOptions {
	headers?: Record<string, string>;
	params?: Record<string, string | number | boolean>;
	timeout?: number;
	body?: unknown;
	method?: string;
	signal?: AbortSignal;
	responseType?:
		| "text"
		| "json"
		| "arraybuffer"
		| "blob"
		| "document"
		| "stream";
}

export interface ResponseType<T> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
	rawResponse: unknown;
}

// 请求接口
export abstract class IRequest {
	abstract get<T>(
		url: string,
		options?: RequestOptions,
	): Promise<ResponseType<T>>;
	abstract post<T>(
		url: string,
		data?: unknown,
		options?: RequestOptions,
	): Promise<ResponseType<T>>;
	abstract request<T>(
		url: string,
		options?: RequestOptions,
	): Promise<ResponseType<T>>;
}
