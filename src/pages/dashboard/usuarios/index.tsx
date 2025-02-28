import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ListaUsuarios } from "@/components/usuarios/ListaUsuarios";
import Head from "next/head";

export default function UsuariosPage() {
  return (
    <>
      <Head>
        <title>Gestão de Usuários | Finsfera</title>
      </Head>

      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
            <p className="text-gray-600">
              Gerencie os membros da equipe e suas permissões de acesso
            </p>
          </div>

          <ListaUsuarios />
        </div>
      </DashboardLayout>
    </>
  );
}
