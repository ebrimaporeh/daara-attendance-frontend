import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useRouter } from "@tanstack/react-router";
import { LoginResponse, User } from "@/types";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      try {
        const userData = await authApi.getProfile();
        return userData;
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authApi.login(phone, password),
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["user"], data.user);

      if (data.user.user_type === "admin") {
        router.navigate({ to: "/admin" });
      } else {
        router.navigate({ to: "/student" });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: any) => authApi.register(userData),
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["user"], data.user);

      if (data.user.user_type === "admin") {
        router.navigate({ to: "/admin" });
      } else {
        router.navigate({ to: "/student" });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    },
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      queryClient.clear();
      router.navigate({ to: "/login" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword, confirmPassword }: any) =>
      authApi.changePassword(oldPassword, newPassword, confirmPassword),
    onSuccess: (data: any) => {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["user"], updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    isAdmin: user?.user_type === "admin",
    isStudent: user?.user_type === "student",
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    changePasswordError: changePasswordMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
};