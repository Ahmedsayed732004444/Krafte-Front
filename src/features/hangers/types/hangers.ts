import type { PaginatedResponse } from "@/shared/types/pagination";
import type { AccessorySize } from "@/features/bookings/types/bookings";

// ─── Partition inside Hanger ───────────────────────────────────────
export interface PartitionSummary {
  id: string;
  name: string;
}

// ─── Hanger ────────────────────────────────────────────────────────
export interface HangerResponse {
  id: string;
  number: number;
  suitSize: AccessorySize;
  partition: PartitionSummary;
}

export type HangersListResponse = PaginatedResponse<HangerResponse>;

// ─── Requests ──────────────────────────────────────────────────────
export interface CreateHangerRequest {
  number: number;
  partitionId: string;
  suitSize: AccessorySize;
}

export interface UpdateHangerRequest {
  number: number;
  partitionId: string;
  suitSize: AccessorySize;
}
