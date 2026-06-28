import type { PaginatedResponse } from "@/shared/types/pagination";

// ─── Hanger inside Partition ───────────────────────────────────────
export interface HangerSummary {
  id: string;
  number: number;
}

// ─── Partition ─────────────────────────────────────────────────────
export interface PartitionResponse {
  id: string;
  name: string;
  hangersCount: number;
  hangers: HangerSummary[];
}

export type PartitionsListResponse = PaginatedResponse<PartitionResponse>;

// ─── Requests ──────────────────────────────────────────────────────
export interface CreatePartitionRequest {
  name: string;
}

export interface UpdatePartitionRequest {
  name: string;
}
