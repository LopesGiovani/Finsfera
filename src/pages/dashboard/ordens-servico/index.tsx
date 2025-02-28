import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardOS } from "@/components/ordens-servico/DashboardOS";
import { ListaOS } from "@/components/ordens-servico/ListaOS";
import Head from "next/head";

export default function OrdensServicoPage() {
  return (
    <>
      <Head>
        <title>Ordens de Serviço | Finsfera</title>
      </Head>

      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
            <p className="text-gray-600">
              Gerencie e acompanhe todas as ordens de serviço da empresa
            </p>
          </div>

          <DashboardOS />

          <ListaOS />
        </div>
      </DashboardLayout>
    </>
  );
}
