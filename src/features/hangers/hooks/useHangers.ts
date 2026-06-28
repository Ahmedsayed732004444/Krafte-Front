import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hangerService } from "../services/hangerService";
import { extractErrorMessage } from "@/lib/api/client";
import type { QueryParams } from "@/shared/types/pagination";
import type { CreateHangerRequest, UpdateHangerRequest } from "../types/hangers";

const QUERY_KEY = "hangers";

// ─── Queries ───────────────────────────────────────────────────────

export const useGetHangers = (params?: QueryParams) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: ({ signal }) => hangerService.getAll(params, signal),
  });

export const useGetHangerById = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => hangerService.getById(id),
    enabled: !!id,
  });

// ─── Mutations ─────────────────────────────────────────────────────

export const useCreateHanger = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHangerRequest) => hangerService.create(body),
    onSuccess: () => {
      toast.success("تم إنشاء الشماعة بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["partitions"] }); // update hangersCount
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useUpdateHanger = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateHangerRequest }) =>
      hangerService.update(id, body),
    onSuccess: () => {
      toast.success("تم تعديل الشماعة بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["partitions"] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useDeleteHanger = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hangerService.remove(id),
    onSuccess: () => {
      toast.success("تم حذف الشماعة بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["partitions"] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};
