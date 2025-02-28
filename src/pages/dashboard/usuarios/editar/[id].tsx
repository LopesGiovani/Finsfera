import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CadastroUsuario } from "@/components/usuarios/CadastroUsuario";
import Head from "next/head";
import { useRouter } from "next/router";

export default function EditarUsuarioPage() {
  const router = useRouter();
  const { id } = router.query;
  const usuarioId = id ? Number(id) : undefined;

  const handleSuccess = () => {
    router.push("/dashboard/usuarios");
  };

  return (
    <>
      <Head>
        <title>Editar Usuário | Finsfera</title>
      </Head>

      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Editar Usuário</h1>
            <p className="text-gray-600">
              Altere os dados e permissões do usuário
            </p>
          </div>

          {usuarioId && (
            <CadastroUsuario usuarioId={usuarioId} onSuccess={handleSuccess} />
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
