export interface CustomerResponse {
  id: string;
  phone: string;
  customerName: string;
  bookingsCount: number;
}

export interface CustomerListResponse {
  items: CustomerResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomerInsightsResponse {
  id: string;
  phone: string;
  customerName: string;
  totalBookings: number;
  activeBookings: number;
  pickedUpBookings: number;
  returnedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalDeductions: number;
  hasDiscount: boolean;
  cancellationRate: number;
  totalRentalDays: number;
  averageRentalDays: number;
  firstBookingDate: string | null;
  lastBookingDate: string | null;
  mostUsedPartition?: string | null;
  mostUsedSuitSize?: string | null;
  customerTier: string;
}

export interface CustomerFilters {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
}
