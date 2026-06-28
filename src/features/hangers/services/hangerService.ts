import { apiClient } from "@/lib/api/client";
import type {
  HangersListResponse,
  HangerResponse,
  CreateHangerRequest,
  UpdateHangerRequest,
} from "../types/hangers";
import type { QueryParams } from "@/shared/types/pagination";

class HangerService {
  /** GET /hangers */
  async getAll(params?: QueryParams, signal?: AbortSignal): Promise<HangersListResponse> {
    const q = new URLSearchParams();
    if (params?.pageNumber) q.append("PageNumber", String(params.pageNumber));
    if (params?.pageSize) q.append("PageSize", String(params.pageSize));
    if (params?.searchValue) q.append("SearchValue", params.searchValue);
    if (params?.sortColumn) q.append("SortColumn", params.sortColumn);
    if (params?.sortDirection) q.append("SortDirection", params.sortDirection);
    const res = await apiClient.get<HangersListResponse>(`/hangers?${q.toString()}`, { signal });
    return res.data;
  }

  /** GET /hangers/{id} */
  async getById(id: string): Promise<HangerResponse> {
    const res = await apiClient.get<HangerResponse>(`/hangers/${id}`);
    return res.data;
  }

  /** POST /hangers */
  async create(body: CreateHangerRequest): Promise<HangerResponse> {
    const res = await apiClient.post<HangerResponse>("/hangers", body);
    return res.data;
  }

  /** PUT /hangers/{id} */
  async update(id: string, body: UpdateHangerRequest): Promise<void> {
    await apiClient.put(`/hangers/${id}`, body);
  }

  /** DELETE /hangers/{id} */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/hangers/${id}`);
  }
}

export const hangerService = new HangerService();
