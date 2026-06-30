import type { PaginatedResponse } from "@/shared/types/pagination";

// ─── Enums matching Backend ────────────────────────────────────────
export type BookingStatus = "Active" | "PickedUp" | "Returned" | "Cancelled";

export type AccessoryColor =
  | "Black"
  | "White"
  | "Gray"
  | "LightGray"
  | "Navy"
  | "RoyalBlue"
  | "SkyBlue"
  | "Blue"
  | "Red"
  | "Burgundy"
  | "Wine"
  | "Rose"
  | "Pink"
  | "Green"
  | "DarkGreen"
  | "Olive"
  | "Mint"
  | "Brown"
  | "Beige"
  | "Camel"
  | "Champagne"
  | "Ivory"
  | "Gold"
  | "Silver"
  | "Purple"
  | "Lavender"
  | "Orange"
  | "Yellow"
  | "Turquoise";

export type ShirtSize =
  | "Size38"
  | "Size40"
  | "Size42"
  | "Size44"
  | "Size46"
  | "Size48"
  | "Size50"
  | "Size52"
  | "Size54"
  | "Size56";

export type AccessorySize = 42 | 44 | 46 | 48 | 50 | 52 | 54 | 56 | 58 | 60 | 62 | 64;

export type BowTieType = "Classic" | "PreTied";

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
  suitSize: AccessorySize;
  eventDate: string;
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
  depositAmount?: number | null;
  idTaken: boolean;
  gravataColor?: AccessoryColor | null;
  shirtColor?: AccessoryColor | null;
  shirtSize?: ShirtSize | null;
  trouserColor?: AccessoryColor | null;
  trouserSize?: AccessorySize | null;
  trouserWaistSize?: number | null;
  trouserLength?: number | null;
  vestColor?: AccessoryColor | null;
  vestSize?: AccessorySize | null;
  hasChain: boolean;
  hasBabyFleur: boolean;
  hasCufflinks: boolean;
  bowTieType?: BowTieType | null;
  bowTieColor?: AccessoryColor | null;
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
  extraDamagePaidAmount?: number;
  extraDamagePaidAt?: string | null;
  damageNotes?: string | null;
}

export interface BookingSummary {
  id: string;
  code: string;
  status: BookingStatus;
  customer: CustomerSummary;
  partitionName: string;
  hangerNumber: number;
  suitSize: AccessorySize;
  eventDate: string;
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
  suitSize: AccessorySize;
  eventDate: string;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  discountPercentage?: number | null;
  depositPaid: boolean;
  depositAmount?: number | null;
  idTaken: boolean;
  gravataColor?: AccessoryColor | null;
  shirtColor?: AccessoryColor | null;
  shirtSize?: ShirtSize | null;
  trouserColor?: AccessoryColor | null;
  trouserSize?: AccessorySize | null;
  trouserWaistSize?: number | null;
  trouserLength?: number | null;
  vestColor?: AccessoryColor | null;
  vestSize?: AccessorySize | null;
  hasChain: boolean;
  hasBabyFleur: boolean;
  hasCufflinks: boolean;
  bowTieType?: BowTieType | null;
  bowTieColor?: AccessoryColor | null;
  notes?: string;
}

export interface UpdateBookingRequest {
  eventDate: string;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  discountPercentage?: number | null;
  depositPaid: boolean;
  depositAmount?: number | null;
  idTaken: boolean;
  gravataColor?: AccessoryColor | null;
  shirtColor?: AccessoryColor | null;
  shirtSize?: ShirtSize | null;
  trouserColor?: AccessoryColor | null;
  trouserSize?: AccessorySize | null;
  trouserWaistSize?: number | null;
  trouserLength?: number | null;
  vestColor?: AccessoryColor | null;
  vestSize?: AccessorySize | null;
  hasChain: boolean;
  hasBabyFleur: boolean;
  hasCufflinks: boolean;
  bowTieType?: BowTieType | null;
  bowTieColor?: AccessoryColor | null;
  notes?: string;
}

export interface ReturnBookingRequest {
  isDamaged: boolean;
  damageAmount?: number | null;
  damageNotes?: string | null;
  extraDamagePaidAmount?: number | null;
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
