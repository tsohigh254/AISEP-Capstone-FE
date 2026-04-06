"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const roleHomeMap: Record<string, string> = {
  Startup: "/startup",
  Investor: "/investor",
  Advisor: "/advisor",
  Admin: "/admin/dashboard",
  Staff: "/staff",
};

const knownRoles = ["Startup", "Investor", "Advisor", "Admin", "Staff"] as const;

function getEffectiveUserRole(user?: IUser) {
  if (!user) return undefined;

  if (user.userType) return user.userType;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const lowerRoles = roles.map((role) => role.toLowerCase());

  for (const knownRole of knownRoles) {
    if (lowerRoles.includes(knownRole.toLowerCase())) {
      return knownRole;
    }
  }

  return undefined;
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthen, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return; 

    const token = localStorage.getItem("accessToken");

    if (!token || !isAuthen || !user) {
      router.replace("/auth/login");
      return;
    }

    const userRole = getEffectiveUserRole(user);
    if (!userRole || !allowedRoles.includes(userRole)) {
      const home = userRole ? roleHomeMap[userRole] || "/auth/login" : "/auth/login";
      router.replace(home);
      return;
    }

    setChecked(true);
  }, [user, isAuthen, isLoading, allowedRoles, router]);

  if (isLoading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#e6cc4c]" />
      </div>
    );
  }

  return <>{children}</>;
}
