import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  ChevronLeftIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { TimelineOS } from "@/components/ordens-servico/TimelineOS";
import { ComentariosOS } from "@/components/ordens-servico/ComentariosOS";
import { StatusOS } from "@/components/ordens-servico/StatusOS";
import { RegistrarTempoModal } from "@/components/ordens-servico/RegistrarTempoModal";
import { GerarFaturaModal } from "@/components/ordens-servico/GerarFaturaModal";
import { UploadArquivos } from "@/components/ordens-servico/UploadArquivos";
import { useRouter } from "next/router";
import {
  useOrdemServico,
  useMudarStatusOS,
  useRegistrarTempo,
} from "@/hooks/useOrdensServico";
import { DetalhesOS } from "@/components/ordens-servico/DetalhesOS";
import Head from "next/head";

export default function DetalhesOSPage() {
  const router = useRouter();
  const { id } = router.query;
  const osId = id ? Number(id) : 0;

  return (
    <>
      <Head>
        <title>Detalhes da OS | Finsfera</title>
      </Head>

      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Ordem de Serviço #{osId}</h1>
            <p className="text-gray-600">
              Detalhes e gerenciamento da ordem de serviço
            </p>
          </div>

          {osId > 0 && <DetalhesOS osId={osId} />}
        </div>
      </DashboardLayout>
    </>
  );
}
