import { StaffShell } from "@/components/staff/staff-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AISEP — Operation Staff Portal",
  description: "Hệ thống quản trị và vận hành AISEP",
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell>{children}</StaffShell>;
}
