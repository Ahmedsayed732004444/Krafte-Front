import type { PaginatedResponse } from "@/shared/types/pagination";

// ─── Partition inside Hanger ───────────────────────────────────────
export interface PartitionSummary {
  id: string;
  name: string;
}

// ─── Hanger ────────────────────────────────────────────────────────
export interface HangerResponse {
  id: string;
  number: number;
  partition: PartitionSummary;
}

export type HangersListResponse = PaginatedResponse<HangerResponse>;

// ─── Requests ──────────────────────────────────────────────────────
export interface CreateHangerRequest {
  number: number;
  partitionId: string;
}

export interface UpdateHangerRequest {
  number: number;
  partitionId: string;
}
