"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useDashboardNavigation() {
  const { currentUser, openModal, showNotification } = useAuth();
  const router = useRouter();

  const goToDashboard = () => {
    if (currentUser) {
      router.push("/account");
      return;
    }

    showNotification("Please log in to access the dashboard.", "error");
    openModal(true);
  };

  return { goToDashboard, isLoggedIn: !!currentUser };
}
