import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analyticsService";

export const useGetDailyReport = (date?: string) => {
  return useQuery({
    queryKey: ["analytics", "daily", date],
    queryFn: () => analyticsService.getDailyReport(date),
  });
};

export const useGetWeeklyReport = (weekStart?: string) => {
  return useQuery({
    queryKey: ["analytics", "weekly", weekStart],
    queryFn: () => analyticsService.getWeeklyReport(weekStart),
  });
};

export const useGetMonthlyReport = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ["analytics", "monthly", year, month],
    queryFn: () => analyticsService.getMonthlyReport(year, month),
  });
};

export const useGetAnnualReport = (year?: number) => {
  return useQuery({
    queryKey: ["analytics", "annual", year],
    queryFn: () => analyticsService.getAnnualReport(year),
  });
};

export const useGetSuitSizes = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["analytics", "suit-sizes", from, to],
    queryFn: () => analyticsService.getSuitSizeRanking(from, to),
  });
};

export const useGetSuitSizesAvailability = () => {
  return useQuery({
    queryKey: ["analytics", "suit-sizes-availability"],
    queryFn: () => analyticsService.getSuitSizeAvailability(),
  });
};

export const useGetHangersUtilization = (partitionId?: string) => {
  return useQuery({
    queryKey: ["analytics", "hangers-utilization", partitionId],
    queryFn: () => analyticsService.getHangerUtilization(partitionId),
  });
};

export const useGetPartitionPerformance = () => {
  return useQuery({
    queryKey: ["analytics", "partitions-performance"],
    queryFn: () => analyticsService.getPartitionPerformance(),
  });
};

export const useGetRevenueBreakdown = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["analytics", "revenue-breakdown", from, to],
    queryFn: () => analyticsService.getRevenueBreakdown(from, to),
  });
};

export const useGetPendingPayments = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["analytics", "pending-payments", from, to],
    queryFn: () => analyticsService.getPendingPayments(from, to),
  });
};

export const useGetAccessories = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["analytics", "accessories-preferences", from, to],
    queryFn: () => analyticsService.getAccessoryPreferences(from, to),
  });
};

export const useGetPeakTimes = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["analytics", "peak-times", from, to],
    queryFn: () => analyticsService.getPeakTimes(from, to),
  });
};

export const useGetCustomerRetention = () => {
  return useQuery({
    queryKey: ["analytics", "customer-retention"],
    queryFn: () => analyticsService.getCustomerRetention(),
  });
};

export const useGetRiskReport = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["analytics", "risk-report", from, to],
    queryFn: () => analyticsService.getRiskReport(from, to),
  });
};
