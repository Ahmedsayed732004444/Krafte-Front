import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingService } from "../services/bookingService";
import { extractErrorMessage } from "@/lib/api/client";
import type { BookingFilters, CreateBookingRequest, UpdateBookingRequest, PickUpBookingRequest, CancelBookingRequest, ReturnBookingRequest } from "../types/bookings";

const QUERY_KEY = "bookings";

// ─── Queries ───────────────────────────────────────────────────────

export const useGetBookings = (params?: BookingFilters) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: ({ signal }) => bookingService.getAll(params, signal),
  });

export const useGetBookingById = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });

export const useGetBookingByCode = (code: string) =>
  useQuery({
    queryKey: [QUERY_KEY, "code", code],
    queryFn: () => bookingService.getByCode(code),
    enabled: !!code,
  });

// ─── Mutations ─────────────────────────────────────────────────────

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBookingRequest) => bookingService.create(body),
    onSuccess: (data) => {
      toast.success(`تم إنشاء الحجز بنجاح ✓ كود الحجز: ${data.code}`);
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["partitions"] }); // refresh occupied counts
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useUpdateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBookingRequest }) =>
      bookingService.update(id, body),
    onSuccess: () => {
      toast.success("تم تعديل بيانات الحجز بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const usePickupBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PickUpBookingRequest }) =>
      bookingService.pickup(id, body),
    onSuccess: () => {
      toast.success("تم تسليم البدلة وتسجيل الدفعة بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useReturnBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReturnBookingRequest }) =>
      bookingService.return(id, body),
    onSuccess: () => {
      toast.success("تم إرجاع البدلة بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["partitions"] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CancelBookingRequest }) =>
      bookingService.cancel(id, body),
    onSuccess: () => {
      toast.success("تم إلغاء الحجز بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["partitions"] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useDeleteBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.remove(id),
    onSuccess: () => {
      toast.success("تم حذف الحجز بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["partitions"] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};
