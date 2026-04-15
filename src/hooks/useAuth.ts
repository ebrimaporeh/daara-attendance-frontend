import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useRouter } from "@tanstack/react-router";
import toast from "react-hot-toast";
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
      toast.success("Welcome back!");

      if (data.user.user_type === "admin") {
        router.navigate({ to: "/admin" });
      } else {
        router.navigate({ to: "/student" });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const registerMutation = useMutation<LoginResponse, Error, any>({
    mutationFn: (userData: any) =>
      authApi.register(userData) as Promise<LoginResponse>,
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["user"], data.user);
      toast.success("Registration successful! Welcome to Ana-Muslimah!");

      if (data.user.user_type === "admin") {
        router.navigate({ to: "/admin" });
      } else {
        router.navigate({ to: "/student" });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
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
      toast.success("Logged out successfully");
      router.navigate({ to: "/login" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword, confirmPassword }: any) =>
      authApi.changePassword(oldPassword, newPassword, confirmPassword),
    onSuccess: (data: any) => {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Password change failed");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["user"], updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Profile update failed");
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
  };
};
