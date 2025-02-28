import { ReactNode } from "react";
import { DashboardSidebar } from "../dashboard/DashboardSidebar";
import { TopBar } from "../TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <DashboardSidebar />
      <div className="pl-[280px] pt-14">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
