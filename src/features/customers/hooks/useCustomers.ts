import { useQuery } from "@tanstack/react-query";
import { customerService } from "../services/customerService";
import type { CustomerFilters } from "../types/customers";

const QUERY_KEY = "customers";

export const useGetCustomers = (params?: CustomerFilters) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => customerService.getAll(params || {}),
  });

export const useGetCustomerById = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });

export const useGetCustomerInsights = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEY, id, "insights"],
    queryFn: () => customerService.getInsights(id),
    enabled: !!id,
  });
