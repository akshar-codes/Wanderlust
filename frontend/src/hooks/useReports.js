import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reportService } from "../services/report.service";
import { ADMIN_KEY } from "./useAdmin";

export const REPORTS_KEY = "reports";

export function useReports(params = {}, opts = {}) {
  return useQuery({
    queryKey: [REPORTS_KEY, params],
    queryFn: () => reportService.getAll(params),
    staleTime: 1000 * 30,
    keepPreviousData: true,
    ...opts,
  });
}

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload) => reportService.create(payload),
    onSuccess: (data) => toast.success(data.message || "Report submitted"),
    onError: (err) => toast.error(err.message || "Failed to submit report"),
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => reportService.resolve(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [REPORTS_KEY] });
      qc.invalidateQueries({ queryKey: [ADMIN_KEY, "stats"] });
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message || "Failed to resolve report"),
  });
}
