"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FunctionReference, FunctionArgs } from "convex/server";

export const useConvexQuery = <T extends FunctionReference<"query">>(
  query: T,
  args?: FunctionArgs<T>
) => {
  const result = useQuery(query, args as any);
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (result === undefined) {
      setIsLoading(true);
    } else {
      try {
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err);
        toast.error(err.message || "An error occurred fetching data");
      } finally {
        setIsLoading(false);
      }
    }
  }, [result]);

  return {
    data,
    isLoading,
    error,
  };
};

export const useConvexMutation = <T extends FunctionReference<"mutation">>(
  mutation: T
) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (args?: FunctionArgs<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(args as any);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      toast.error(err.message || "Action failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};
