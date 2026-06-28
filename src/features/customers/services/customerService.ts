import { apiClient } from "@/lib/api/client";
import type {
  CustomerListResponse,
  CustomerResponse,
  CustomerInsightsResponse,
  CustomerFilters
} from "../types/customers";

class CustomerService {
  async getAll(filters: CustomerFilters): Promise<CustomerListResponse> {
    const params = new URLSearchParams();
    if (filters.pageNumber) params.append("pageNumber", String(filters.pageNumber));
    if (filters.pageSize) params.append("pageSize", String(filters.pageSize));
    if (filters.searchValue) params.append("searchValue", filters.searchValue);

    const res = await apiClient.get<CustomerListResponse>(`/customers?${params.toString()}`);
    return res.data;
  }

  async getById(id: string): Promise<CustomerResponse> {
    const res = await apiClient.get<CustomerResponse>(`/customers/${id}`);
    return res.data;
  }

  async getInsights(id: string): Promise<CustomerInsightsResponse> {
    const res = await apiClient.get<CustomerInsightsResponse>(`/customers/${id}/insights`);
    return res.data;
  }
}

export const customerService = new CustomerService();
