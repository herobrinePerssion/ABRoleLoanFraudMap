/**
 * API 客户端 - 统一的数据请求接口
 * 支持请求拦截、错误处理、超时机制、数据缓存
 */

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, any>;
}

interface RequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number; // milliseconds
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class ApiClient {
  private baseUrl = '/api';
  private timeout = 5000;
  private retries = 2;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private requestInterceptors: Array<(config: any) => any> = [];
  private responseInterceptors: Array<(response: ApiResponse<any>) => ApiResponse<any>> = [];
  private errorInterceptors: Array<(error: ApiError) => ApiError> = [];

  /**
   * 执行网络请求（模拟）
   */
  async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const finalConfig = {
      timeout: this.timeout,
      retries: this.retries,
      cache: false,
      cacheTTL: 0,
      ...config,
    };

    const cacheKey = `${method}:${url}:${JSON.stringify(data || {})}`;

    // 检查缓存
    if (finalConfig.cache && method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
    }

    // 请求前拦截
    let requestData = { method, url, data };
    for (const interceptor of this.requestInterceptors) {
      requestData = interceptor(requestData);
    }

    // 执行请求（带重试机制）
    let lastError: ApiError | null = null;
    for (let attempt = 0; attempt <= finalConfig.retries; attempt++) {
      try {
        const response = await this.executeRequest<T>(
          requestData.method,
          requestData.url,
          requestData.data,
          finalConfig.timeout
        );

        // 响应后拦截
        let finalResponse = response;
        for (const interceptor of this.responseInterceptors) {
          finalResponse = interceptor(finalResponse);
        }

        const result = finalResponse.data;

        // 保存缓存
        if (finalConfig.cache && method === 'GET') {
          this.cache.set(cacheKey, {
            data: result,
            expiresAt: Date.now() + finalConfig.cacheTTL,
          });
        }

        return result;
      } catch (error) {
        lastError = error as ApiError;
        if (attempt < finalConfig.retries) {
          // 指数退避策略
          await this.delay(Math.pow(2, attempt) * 100);
        }
      }
    }

    // 错误拦截
    if (lastError) {
      for (const interceptor of this.errorInterceptors) {
        lastError = interceptor(lastError);
      }
      throw lastError;
    }

    throw new Error('Request failed');
  }

  /**
   * GET 请求
   */
  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * POST 请求
   */
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * PUT 请求
   */
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * DELETE 请求
   */
  delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * 实际执行请求逻辑（模拟实现）
   */
  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    timeout?: number
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject({
          code: -1,
          message: `Request timeout after ${timeout}ms`,
        } as ApiError);
      }, timeout);

      // 模拟网络延迟
      setTimeout(() => {
        clearTimeout(timer);
        // 这里会被 mockApi 层拦截处理
        resolve({
          code: 200,
          message: 'OK',
          data: data as T,
          timestamp: Date.now(),
        });
      }, Math.random() * 500);
    });
  }

  /**
   * 延迟函数（用于重试等待）
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 注册请求拦截器
   */
  use(type: 'request' | 'response' | 'error', interceptor: any) {
    if (type === 'request') {
      this.requestInterceptors.push(interceptor);
    } else if (type === 'response') {
      this.responseInterceptors.push(interceptor);
    } else if (type === 'error') {
      this.errorInterceptors.push(interceptor);
    }
  }

  /**
   * 清空缓存
   */
  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// 导出单例
export const apiClient = new ApiClient();
