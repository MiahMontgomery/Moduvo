import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService, type User } from "@/lib/auth";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: AuthService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      AuthService.setAuthToken(data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.register,
    onSuccess: (data) => {
      AuthService.setAuthToken(data.token);
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      AuthService.removeAuthToken();
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}
