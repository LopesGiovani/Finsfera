import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PLSection } from "@/components/dashboard/PLSection";
import { CashFlowSection } from "../../components/dashboard/CashFlowSection";
import { FinancialRatios } from "../../components/dashboard/FinancialRatios";
import { InvoiceSection } from "../../components/dashboard/InvoiceSection";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const clients = [
  {
    id: 1,
    name: "Armajaro",
    location: "Chicago (GMT-5)",
    status: "Active",
    fiscalYearEnd: "12.31",
  },
  {
    id: 2,
    name: "Evergreen",
    location: "London (GMT)",
    status: "Active",
    fiscalYearEnd: "05.31",
  },
  {
    id: 3,
    name: "Willis Industries",
    location: "New York (GMT-4)",
    status: "Active",
    fiscalYearEnd: "12.31",
  },
];

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log("Dashboard montado - Estado da autenticação:", {
      isAuthenticated,
      loading,
      hasUser: !!user,
      userData: user,
    });
  }, [isAuthenticated, loading, user]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <PLSection />
          <CashFlowSection />
          <FinancialRatios />
          <InvoiceSection />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
