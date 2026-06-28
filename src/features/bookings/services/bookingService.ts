import { apiClient } from "@/lib/api/client";
import type {
  BookingsListResponse,
  BookingResponse,
  CreateBookingRequest,
  UpdateBookingRequest,
  PickUpBookingRequest,
  CancelBookingRequest,
  ReturnBookingRequest,
  BookingFilters,
} from "../types/bookings";

class BookingService {
  /** GET /bookings */
  async getAll(params?: BookingFilters, signal?: AbortSignal): Promise<BookingsListResponse> {
    const q = new URLSearchParams();
    if (params?.pageNumber) q.append("PageNumber", String(params.pageNumber));
    if (params?.pageSize) q.append("PageSize", String(params.pageSize));
    if (params?.searchValue) q.append("SearchValue", params.searchValue);
    if (params?.sortColumn) q.append("SortColumn", params.sortColumn);
    if (params?.sortDirection !== undefined) q.append("SortDirection", String(params.sortDirection));
    if (params?.status !== undefined) q.append("Status", String(params.status));
    if (params?.partitionId) q.append("PartitionId", params.partitionId);
    if (params?.hangerId) q.append("HangerId", params.hangerId);
    if (params?.customerPhone) q.append("CustomerPhone", params.customerPhone);
    if (params?.fromDate) q.append("FromDate", params.fromDate);
    if (params?.toDate) q.append("ToDate", params.toDate);
    if (params?.isExpired !== undefined) q.append("IsExpired", String(params.isExpired));
    if (params?.hasDiscount !== undefined) q.append("HasDiscount", String(params.hasDiscount));
    if (params?.depositPaid !== undefined) q.append("DepositPaid", String(params.depositPaid));
    if (params?.idTaken !== undefined) q.append("IdTaken", String(params.idTaken));

    const res = await apiClient.get<BookingsListResponse>(`/bookings?${q.toString()}`, { signal });
    return res.data;
  }

  /** GET /bookings/{id} */
  async getById(id: string): Promise<BookingResponse> {
    const res = await apiClient.get<BookingResponse>(`/bookings/${id}`);
    return res.data;
  }

  /** GET /bookings/code/{code} */
  async getByCode(code: string): Promise<BookingResponse> {
    const res = await apiClient.get<BookingResponse>(`/bookings/code/${code}`);
    return res.data;
  }

  /** POST /bookings */
  async create(body: CreateBookingRequest): Promise<BookingResponse> {
    const res = await apiClient.post<BookingResponse>("/bookings", body);
    return res.data;
  }

  /** PUT /bookings/{id} */
  async update(id: string, body: UpdateBookingRequest): Promise<void> {
    await apiClient.put(`/bookings/${id}`, body);
  }

  /** PUT /bookings/{id}/pickup */
  async pickup(id: string, body: PickUpBookingRequest): Promise<BookingResponse> {
    const res = await apiClient.put<BookingResponse>(`/bookings/${id}/pickup`, body);
    return res.data;
  }

  /** PATCH /bookings/{id}/return */
  async return(id: string, body: ReturnBookingRequest): Promise<BookingResponse> {
    const res = await apiClient.patch<BookingResponse>(`/bookings/${id}/return`, body);
    return res.data;
  }

  /** PATCH /bookings/{id}/cancel */
  async cancel(id: string, body: CancelBookingRequest): Promise<void> {
    await apiClient.patch(`/bookings/${id}/cancel`, body);
  }

  /** DELETE /bookings/{id} */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  }
}

export const bookingService = new BookingService();
