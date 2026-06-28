import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partitionService } from "../services/partitionService";
import { extractErrorMessage } from "@/lib/api/client";
import type { QueryParams } from "@/shared/types/pagination";
import type { CreatePartitionRequest, UpdatePartitionRequest } from "../types/partitions";

const QUERY_KEY = "partitions";

// ─── Queries ───────────────────────────────────────────────────────

export const useGetPartitions = (params?: QueryParams) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: ({ signal }) => partitionService.getAll(params, signal),
  });

export const useGetPartitionById = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => partitionService.getById(id),
    enabled: !!id,
  });

// ─── Mutations ─────────────────────────────────────────────────────

export const useCreatePartition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePartitionRequest) => partitionService.create(body),
    onSuccess: () => {
      toast.success("تم إنشاء القسم بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useUpdatePartition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePartitionRequest }) =>
      partitionService.update(id, body),
    onSuccess: () => {
      toast.success("تم تعديل القسم بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useDeletePartition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => partitionService.remove(id),
    onSuccess: () => {
      toast.success("تم حذف القسم بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};
