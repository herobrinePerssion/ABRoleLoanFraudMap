/**
 * 模拟 API 实现 - 基于 localStorage 的数据持久化
 * 提供所有业务域的数据接口（案例、举报、反馈、搜索等）
 */

import { apiClient, ApiResponse, ApiError } from './apiClient';
import { ReportRecord, ReportStatus } from '@/types/report';
import { FraudCase } from '@/types/case';
import { FRAUD_CASES } from '@/constants/cases';

/**
 * 初始化 Mock API 拦截器
 */
export function initMockApi() {
  // 响应拦截 - 将本地数据作为 API 响应
  apiClient.use('response', (response: ApiResponse<any>) => {
    return {
      ...response,
      code: 200,
      message: 'Success',
      timestamp: Date.now(),
    };
  });

  // 错误拦截 - 标准化错误格式
  apiClient.use('error', (error: ApiError) => {
    return {
      code: error.code || 500,
      message: error.message || 'Unknown error',
      details: error.details,
    };
  });
}

/**
 * 案例数据 API
 */
export const caseApi = {
  /**
   * 获取所有案例（支持过滤和排序）
   */
  async getCases(filter?: {
    keyword?: string;
    region?: string;
    scamType?: string;
    riskLevel?: string;
    status?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: FraudCase[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return apiClient.get('/cases', { cache: true, cacheTTL: 60000 }).then(() => {
      let items = [...FRAUD_CASES];

      // 应用过滤
      if (filter?.keyword) {
        const kw = filter.keyword.toLowerCase();
        items = items.filter(
          (c) =>
            c.title.toLowerCase().includes(kw) ||
            c.summary.toLowerCase().includes(kw)
        );
      }

      if (filter?.region) {
        items = items.filter((c) => c.region === filter.region);
      }

      if (filter?.scamType) {
        items = items.filter((c) => c.scamType === filter.scamType);
      }

      if (filter?.riskLevel) {
        items = items.filter((c) => c.riskLevel === filter.riskLevel);
      }

      if (filter?.status) {
        items = items.filter((c) => c.progress === filter.status);
      }

      // 应用排序
      if (filter?.sortBy) {
        switch (filter.sortBy) {
          case 'updated-desc':
            items.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            break;
          case 'amount-desc':
            items.sort((a, b) => (b.amountLoss || 0) - (a.amountLoss || 0));
            break;
          case 'amount-asc':
            items.sort((a, b) => (a.amountLoss || 0) - (b.amountLoss || 0));
            break;
        }
      }

      // 应用分页
      const page = filter?.page || 1;
      const pageSize = filter?.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        items: items.slice(start, end),
        total: items.length,
        page,
        pageSize,
      };
    });
  },

  /**
   * 获取单个案例详情
   */
  async getCaseById(id: string): Promise<FraudCase> {
    return apiClient.get(`/cases/${id}`, { cache: true, cacheTTL: 120000 }).then(() => {
      const caseData = FRAUD_CASES.find((c) => c.id === id);
      if (!caseData) {
        const error: ApiError = {
          code: 404,
          message: 'Case not found',
        };
        throw error;
      }
      return caseData;
    });
  },

  /**
   * 搜索案例（全文搜索）
   */
  async searchCases(query: string): Promise<FraudCase[]> {
    return apiClient.get('/cases/search', { cache: true, cacheTTL: 30000 }).then(() => {
      const q = query.toLowerCase();
      return FRAUD_CASES.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.warningSignals.some((w) => w.toLowerCase().includes(q)) ||
          c.suggestions.some((s) => s.toLowerCase().includes(q))
      );
    });
  },

  /**
   * 获取相关案例
   */
  async getRelatedCases(caseId: string, limit: number = 4): Promise<FraudCase[]> {
    return apiClient.get(`/cases/${caseId}/related`, { cache: true, cacheTTL: 60000 }).then(() => {
      const currentCase = FRAUD_CASES.find((c) => c.id === caseId);
      if (!currentCase) return [];

      return FRAUD_CASES.filter(
        (c) => c.id !== caseId && c.scamType === currentCase.scamType
      ).slice(0, limit);
    });
  },
};

/**
 * 举报/反馈数据 API
 */
export const reportApi = {
  /**
   * 提交举报
   */
  async submitReport(data: {
    title: string;
    description: string;
    caseId?: string;
    contactInfo?: string;
    evidence?: string[];
  }): Promise<{ reportId: string; status: ReportStatus }> {
    return apiClient.post('/reports', data).then(() => {
      const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // 保存到 localStorage
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      reports.push({
        ...data,
        reportId,
        status: '待初审',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('reports', JSON.stringify(reports));

      return { reportId, status: '待初审' };
    });
  },

  /**
   * 查询举报进度
   */
  async getReportStatus(reportId: string): Promise<ReportRecord> {
    return apiClient.get(`/reports/${reportId}`).then(() => {
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      const report = reports.find((r: any) => r.reportId === reportId);

      if (!report) {
        const error: ApiError = {
          code: 404,
          message: 'Report not found',
        };
        throw error;
      }

      return report as ReportRecord;
    });
  },

  /**
   * 更新举报状态（模拟后台操作）
   */
  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    feedback?: string
  ): Promise<void> {
    return apiClient.put(`/reports/${reportId}`, { status, feedback }).then(() => {
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      const report = reports.find((r: any) => r.reportId === reportId);

      if (report) {
        report.status = status;
        if (feedback) report.feedback = feedback;
        report.updatedAt = new Date().toISOString();
        localStorage.setItem('reports', JSON.stringify(reports));
      }
    });
  },

  /**
   * 获取我的举报列表
   */
  async getMyReports(page: number = 1, pageSize: number = 10): Promise<{
    items: ReportRecord[];
    total: number;
  }> {
    return apiClient.get('/reports/my').then(() => {
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      const start = (page - 1) * pageSize;

      return {
        items: reports.slice(start, start + pageSize),
        total: reports.length,
      };
    });
  },
};

/**
 * 用户反馈 API
 */
export const feedbackApi = {
  /**
   * 提交反馈
   */
  async submitFeedback(data: {
    type: 'bug' | 'feature' | 'feedback';
    title: string;
    description: string;
    email?: string;
    attachments?: string[];
  }): Promise<{ feedbackId: string }> {
    return apiClient.post('/feedback', data).then(() => {
      const feedbackId = `FDB-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      feedbacks.push({
        ...data,
        feedbackId,
        createdAt: new Date().toISOString(),
        status: 'received',
      });
      localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

      return { feedbackId };
    });
  },

  /**
   * 获取反馈列表
   */
  async getFeedbacks(type?: string): Promise<any[]> {
    return apiClient.get('/feedback').then(() => {
      let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      if (type) {
        feedbacks = feedbacks.filter((f: any) => f.type === type);
      }
      return feedbacks;
    });
  },
};

/**
 * 搜索 API
 */
export const searchApi = {
  /**
   * 全局搜索
   */
  async search(query: string, types?: ('cases' | 'reports' | 'knowledge')[]): Promise<{
    cases: FraudCase[];
    reports: any[];
    knowledge: any[];
  }> {
    return apiClient.get('/search', { cache: true, cacheTTL: 30000 }).then(() => {
      const results = {
        cases: [] as FraudCase[],
        reports: [] as any[],
        knowledge: [] as any[],
      };

      const q = query.toLowerCase();

      // 搜索案例
      if (!types || types.includes('cases')) {
        results.cases = FRAUD_CASES.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q)
        ).slice(0, 5);
      }

      // 搜索举报
      if (!types || types.includes('reports')) {
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        results.reports = reports
          .filter((r: any) => r.title.toLowerCase().includes(q))
          .slice(0, 5);
      }

      return results;
    });
  },
};

/**
 * 统计 API
 */
export const statsApi = {
  /**
   * 获取全局统计数据
   */
  async getStats(): Promise<{
    totalCases: number;
    totalReports: number;
    totalLoss: number;
    regionDistribution: Record<string, number>;
    scamTypeDistribution: Record<string, number>;
  }> {
    return apiClient.get('/stats', { cache: true, cacheTTL: 300000 }).then(() => {
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');

      const regionDistribution: Record<string, number> = {};
      const scamTypeDistribution: Record<string, number> = {};
      let totalLoss = 0;

      FRAUD_CASES.forEach((c) => {
        regionDistribution[c.region] = (regionDistribution[c.region] || 0) + 1;
        scamTypeDistribution[c.scamType] = (scamTypeDistribution[c.scamType] || 0) + 1;
        totalLoss += c.amountLoss || 0;
      });

      return {
        totalCases: FRAUD_CASES.length,
        totalReports: reports.length,
        totalLoss,
        regionDistribution,
        scamTypeDistribution,
      };
    });
  },
};
