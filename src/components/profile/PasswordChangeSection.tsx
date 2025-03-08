import React, { useState } from "react";
import { KeyIcon } from "@heroicons/react/24/outline";

interface PasswordChangeSectionProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  isPasswordChanging: boolean;
  setIsPasswordChanging: (value: boolean) => void;
}

export function PasswordChangeSection({
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  isPasswordChanging,
  setIsPasswordChanging,
}: PasswordChangeSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <KeyIcon className="w-5 h-5 mr-2" />
        Alterar Senha
      </h3>

      <div className="flex items-center mb-4">
        <button
          type="button"
          className={`px-4 py-2 text-sm rounded-lg ${
            isPasswordChanging
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setIsPasswordChanging(!isPasswordChanging)}
        >
          {isPasswordChanging ? "Cancelar alteração" : "Alterar senha"}
        </button>
      </div>

      {isPasswordChanging && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha atual
            </label>
            <input
              type="password"
              id="currentPassword"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border px-3"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nova senha
            </label>
            <input
              type="password"
              id="newPassword"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border px-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirme a nova senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border px-3"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
