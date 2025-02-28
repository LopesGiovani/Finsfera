import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CadastroOS } from "@/components/ordens-servico/CadastroOS";
import Head from "next/head";
import { useRouter } from "next/router";

export default function NovaOSPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/ordens-servico");
  };

  return (
    <>
      <Head>
        <title>Nova Ordem de Serviço | Finsfera</title>
      </Head>

      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>
            <p className="text-gray-600">
              Crie uma nova ordem de serviço e designe um responsável
            </p>
          </div>

          <CadastroOS onSuccess={handleSuccess} />
        </div>
      </DashboardLayout>
    </>
  );
}
