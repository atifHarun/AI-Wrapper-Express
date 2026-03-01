import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { AnalyzeRequest, AnalyzeResponse } from "@shared/schema";

export function useAnalyze() {
  return useMutation({
    mutationFn: async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
      const res = await fetch(api.analyze.create.path, {
        method: api.analyze.create.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let errorMessage = "Failed to generate analysis. Please try again.";
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Fallback to standard status text if json parsing fails
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return res.json();
    },
  });
}
