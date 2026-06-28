import { apiClient } from "@/lib/api/client";
import type {
  PartitionsListResponse,
  PartitionResponse,
  CreatePartitionRequest,
  UpdatePartitionRequest,
} from "../types/partitions";
import type { QueryParams } from "@/shared/types/pagination";

class PartitionService {
  /** GET /partitions */
  async getAll(params?: QueryParams, signal?: AbortSignal): Promise<PartitionsListResponse> {
    const q = new URLSearchParams();
    if (params?.pageNumber) q.append("PageNumber", String(params.pageNumber));
    if (params?.pageSize) q.append("PageSize", String(params.pageSize));
    if (params?.searchValue) q.append("SearchValue", params.searchValue);
    if (params?.sortColumn) q.append("SortColumn", params.sortColumn);
    if (params?.sortDirection) q.append("SortDirection", params.sortDirection);
    const res = await apiClient.get<PartitionsListResponse>(`/partitions?${q.toString()}`, { signal });
    return res.data;
  }

  /** GET /partitions/{id} */
  async getById(id: string): Promise<PartitionResponse> {
    const res = await apiClient.get<PartitionResponse>(`/partitions/${id}`);
    return res.data;
  }

  /** POST /partitions */
  async create(body: CreatePartitionRequest): Promise<PartitionResponse> {
    const res = await apiClient.post<PartitionResponse>("/partitions", body);
    return res.data;
  }

  /** PUT /partitions/{id} */
  async update(id: string, body: UpdatePartitionRequest): Promise<void> {
    await apiClient.put(`/partitions/${id}`, body);
  }

  /** DELETE /partitions/{id} */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/partitions/${id}`);
  }
}

export const partitionService = new PartitionService();
