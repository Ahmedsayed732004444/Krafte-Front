import { apiClient } from "@/lib/api/client";
import type {
  DailyReportResponse,
  WeeklyReportResponse,
  MonthlyReportResponse,
  AnnualReportResponse,
  SuitSizeRankingResponse,
  SuitSizeAvailabilityResponse,
  HangerUtilizationResponse,
  PartitionPerformanceResponse,
  RevenueBreakdownResponse,
  PendingPaymentsResponse,
  AccessoryPreferencesResponse,
  PeakTimesResponse,
  CustomerRetentionResponse,
  RiskReportResponse,
} from "../types/analytics";

class AnalyticsService {
  /** GET /analytics/reports/daily */
  async getDailyReport(date?: string): Promise<DailyReportResponse> {
    const res = await apiClient.get<DailyReportResponse>("/analytics/reports/daily", {
      params: date ? { date } : {},
    });
    return res.data;
  }

  /** GET /analytics/reports/weekly */
  async getWeeklyReport(weekStart?: string): Promise<WeeklyReportResponse> {
    const res = await apiClient.get<WeeklyReportResponse>("/analytics/reports/weekly", {
      params: weekStart ? { weekStart } : {},
    });
    return res.data;
  }

  /** GET /analytics/reports/monthly */
  async getMonthlyReport(year?: number, month?: number): Promise<MonthlyReportResponse> {
    const params: Record<string, any> = {};
    if (year !== undefined) params.year = year;
    if (month !== undefined) params.month = month;
    const res = await apiClient.get<MonthlyReportResponse>("/analytics/reports/monthly", {
      params,
    });
    return res.data;
  }

  /** GET /analytics/reports/annual */
  async getAnnualReport(year?: number): Promise<AnnualReportResponse> {
    const res = await apiClient.get<AnnualReportResponse>("/analytics/reports/annual", {
      params: year !== undefined ? { year } : {},
    });
    return res.data;
  }

  /** GET /analytics/suit-sizes */
  async getSuitSizeRanking(from?: string, to?: string): Promise<SuitSizeRankingResponse> {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<SuitSizeRankingResponse>("/analytics/suit-sizes", {
      params,
    });
    return res.data;
  }

  /** GET /analytics/suit-sizes/availability */
  async getSuitSizeAvailability(): Promise<SuitSizeAvailabilityResponse> {
    const res = await apiClient.get<SuitSizeAvailabilityResponse>("/analytics/suit-sizes/availability");
    return res.data;
  }

  /** GET /analytics/hangers/utilization */
  async getHangerUtilization(partitionId?: string): Promise<HangerUtilizationResponse> {
    const res = await apiClient.get<HangerUtilizationResponse>("/analytics/hangers/utilization", {
      params: partitionId ? { partitionId } : {},
    });
    return res.data;
  }

  /** GET /analytics/partitions/performance */
  async getPartitionPerformance(): Promise<PartitionPerformanceResponse> {
    const res = await apiClient.get<PartitionPerformanceResponse>("/analytics/partitions/performance");
    return res.data;
  }

  /** GET /analytics/revenue */
  async getRevenueBreakdown(from?: string, to?: string): Promise<RevenueBreakdownResponse> {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<RevenueBreakdownResponse>("/analytics/revenue", {
      params,
    });
    return res.data;
  }

  /** GET /analytics/pending-payments */
  async getPendingPayments(from?: string, to?: string): Promise<PendingPaymentsResponse> {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<PendingPaymentsResponse>("/analytics/pending-payments", { params });
    return res.data;
  }

  /** GET /analytics/accessories */
  async getAccessoryPreferences(from?: string, to?: string): Promise<AccessoryPreferencesResponse> {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<AccessoryPreferencesResponse>("/analytics/accessories", { params });
    return res.data;
  }

  /** GET /analytics/peak-times */
  async getPeakTimes(from?: string, to?: string): Promise<PeakTimesResponse> {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<PeakTimesResponse>("/analytics/peak-times", { params });
    return res.data;
  }

  /** GET /analytics/customers/retention */
  async getCustomerRetention(): Promise<CustomerRetentionResponse> {
    const res = await apiClient.get<CustomerRetentionResponse>("/analytics/customers/retention");
    return res.data;
  }

  /** GET /analytics/risks */
  async getRiskReport(from?: string, to?: string): Promise<RiskReportResponse> {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<RiskReportResponse>("/analytics/risks", { params });
    return res.data;
  }

  /** GET /analytics/export */
  async exportExcel(reportType: number, from?: string, to?: string): Promise<Blob> {
    const params: Record<string, any> = { reportType };
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<Blob>("/analytics/export", {
      params,
      responseType: "blob",
    });
    return res.data;
  }
}

export const analyticsService = new AnalyticsService();
