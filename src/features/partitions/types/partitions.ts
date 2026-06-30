import type { PaginatedResponse } from "@/shared/types/pagination";
import type { AccessorySize } from "@/features/bookings/types/bookings";

// ─── Hanger inside Partition ───────────────────────────────────────
export interface HangerSummary {
  id: string;
  number: number;
  suitSize: AccessorySize;
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
