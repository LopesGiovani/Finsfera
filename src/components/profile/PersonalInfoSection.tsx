import React from "react";
import {
  IdentificationIcon,
  UserIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { User } from "@/contexts/AuthContext";

interface PersonalInfoSectionProps {
  user: User | null;
  name: string;
  setName: (value: string) => void;
}

export function PersonalInfoSection({
  user,
  name,
  setName,
}: PersonalInfoSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <IdentificationIcon className="w-5 h-5 mr-2" />
        Dados Pessoais
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border px-3"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 sm:text-sm h-10 border px-3"
              placeholder="Seu email"
              value={user?.email || ""}
              disabled
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            O email não pode ser alterado
          </p>
        </div>
      </div>
    </div>
  );
}
