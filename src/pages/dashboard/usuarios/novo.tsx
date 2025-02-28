import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CadastroUsuario } from "@/components/usuarios/CadastroUsuario";
import Head from "next/head";
import { useRouter } from "next/router";

export default function NovoUsuarioPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/usuarios");
  };

  return (
    <>
      <Head>
        <title>Novo Usuário | Finsfera</title>
      </Head>

      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Novo Usuário</h1>
            <p className="text-gray-600">Adicione um novo membro à equipe</p>
          </div>

          <CadastroUsuario onSuccess={handleSuccess} />
        </div>
      </DashboardLayout>
    </>
  );
}
