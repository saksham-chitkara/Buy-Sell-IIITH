import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AdditionalDetails {
  age: number;
  contactNumber: string;
  password: string;
  [key: string]: string | number;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  contactNumber: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        recaptchaToken, // v2 token doesn't need an action
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      router.push("/explore");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Login failed",
        description:
          ("response" in err && err.response?.data?.message) ||
          "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    formData: RegisterFormData,
    recaptchaToken: string
  ) => {
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        ...formData,
        recaptchaToken, // v2 token doesn't need an action
      });

      toast({
        title: "Registration successful",
        description: "Please check your email for verification.",
      });

      router.push("/auth/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempToken");
    localStorage.removeItem("tempUserData");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push("/auth/login");
  };

  const loginWithCAS = async () => {
    const serviceUrl = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/cas/callback`
    );
    const casLoginUrl = `https://login.iiit.ac.in/cas/login?service=${serviceUrl}`;
    window.location.href = casLoginUrl;
  };

  const verifyCASTicket = async (ticket: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/cas/verify", {
        ticket,
      });

      if (data.requiresAdditionalDetails) {
        localStorage.setItem("tempToken", data.tempToken);
        localStorage.setItem("tempUserData", JSON.stringify(data.userData));
        router.push("/auth/cas/complete-registration");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Welcome!",
          description: "You have been successfully logged in.",
        });
        router.push("/explore");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Authentication failed",
        description: err.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      router.push("/auth/login");
    } finally {
      setIsLoading(false);
    }
  };

  const completeCASRegistration = async (
    additionalDetails: AdditionalDetails & { recaptchaToken: string }
  ) => {
    setIsLoading(true);
    try {
      const tempToken = localStorage.getItem("tempToken");
      if (!tempToken) {
        throw new Error("Registration session expired");
      }

      const { data } = await api.post("/auth/cas/complete", {
        tempToken,
        ...additionalDetails, // recaptchaToken included in additionalDetails
      });

      localStorage.removeItem("tempToken");
      localStorage.removeItem("tempUserData");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Registration complete!",
        description: "Your account has been created successfully.",
      });

      router.push("/explore");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading,
    loginWithCAS,
    verifyCASTicket,
    completeCASRegistration,
  };
};
