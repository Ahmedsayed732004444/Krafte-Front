import type { PaginatedResponse } from "@/shared/types/pagination";

// ─── Enums matching Backend ────────────────────────────────────────
export type BookingStatus = "Active" | "PickedUp" | "Returned" | "Cancelled";

export type SuitSize = 42 | 44 | 46 | 48 | 50 | 52 | 54 | 56;

export type GravataColor = "Red" | "Blue" | "Green" | "Black" | "White" | "Yellow" | "Purple" | "Orange";
export type ShirtColor = "White" | "Black";
export type ShirtSize = "Size55" | "Size56" | "Size57" | "Size58" | "Size59" | "Size60";
export type TrouserColor = "Black" | "White" | "Gray" | "Navy" | "Brown" | "Beige" | "Burgundy";
export type VestColor = "Black" | "White" | "Gray" | "Navy" | "Brown" | "Beige" | "Burgundy" | "Green" | "Blue";

// ─── DTOs & Interfaces ─────────────────────────────────────────────
export interface CustomerSummary {
  id: string;
  phone: string;
  customerName: string;
}

export interface BookingResponse {
  id: string;
  code: string;
  status: BookingStatus;
  customer: CustomerSummary;
  partitionName: string;
  hangerNumber: number;
  suitSize: number; // Represents the numeric size, e.g. 42
  fromDate: string;
  toDate: string;
  rentalDays: number;
  totalAmount: number;
  discountPercentage?: number | null;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  depositPaid: boolean;
  depositAmount?: number;
  idTaken: boolean;
  gravataColor?: GravataColor | null;
  shirtColor?: ShirtColor | null;
  shirtSize?: ShirtSize | null;
  trouserColor?: TrouserColor | null;
  trouserWaistSize?: number | null;
  trouserLength?: number | null;
  vestColor?: VestColor | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  pickedUpAt?: string | null;
  returnedAt?: string | null;
  cancelledAt?: string | null;
  deductionAmount?: number | null;
  refundAmount?: number | null;
  depositRefundAmount?: number | null;
  cancellationReason?: string | null;
  isExpired: boolean;
  isDamaged: boolean;
  damageAmount?: number | null;
  damageDepositRefund?: number | null;
  extraDamageOwed?: number | null;
  damageNotes?: string | null;
}

export interface BookingSummary {
  id: string;
  code: string;
  status: BookingStatus;
  customer: CustomerSummary;
  partitionName: string;
  hangerNumber: number;
  suitSize: number;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export type BookingsListResponse = PaginatedResponse<BookingResponse>;

// ─── Request Models ────────────────────────────────────────────────
export interface CreateBookingRequest {
  customerPhone: string;
  customerName?: string;
  partitionId: string;
  hangerId: string;
  suitSize: number;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  discountPercentage?: number | null;
  depositPaid: boolean;
  depositAmount?: number;
  idTaken: boolean;
  gravataColor?: GravataColor | null;
  shirtColor?: ShirtColor | null;
  shirtSize?: ShirtSize | null;
  trouserColor?: TrouserColor | null;
  trouserWaistSize?: number | null;
  trouserLength?: number | null;
  vestColor?: VestColor | null;
  notes?: string;
}

export interface UpdateBookingRequest {
  fromDate: string;
  toDate: string;
  totalAmount: number;
  discountPercentage?: number | null;
  depositPaid: boolean;
  depositAmount?: number;
  idTaken: boolean;
  notes?: string;
}

export interface ReturnBookingRequest {
  isDamaged: boolean;
  damageAmount?: number | null;
  damageNotes?: string | null;
}

export interface CancelBookingRequest {
  deductionAmount: number;
  cancellationReason?: string | null;
}

export interface PickUpBookingRequest {
  paidAmount: number;
  idTaken: boolean;
}

export interface BookingFilters {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  sortColumn?: string;
  sortDirection?: "Asc" | "Desc" | number;
  status?: string | number;
  partitionId?: string;
  hangerId?: string;
  customerPhone?: string;
  fromDate?: string;
  toDate?: string;
  isExpired?: boolean;
  hasDiscount?: boolean;
  depositPaid?: boolean;
  idTaken?: boolean;
  isDamaged?: boolean;
}
