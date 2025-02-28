import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Obter a inicial do nome do usuário para o avatar
  const getInitials = () => {
    if (!user?.name) return "?";
    return user.name.charAt(0).toUpperCase();
  };

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Não é necessário redirecionar aqui, o AuthContext já faz isso
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-sm font-medium">
          {getInitials()}
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                {getInitials()}
              </div>
              <div>
                <div className="font-medium">
                  {user?.name || "Carregando..."}
                </div>
                <div className="text-sm text-gray-500">
                  {user?.email || "..."}
                </div>
              </div>
            </div>

            <div className="border-t my-2" />

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Perfil</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isLoggingOut ? "text-gray-400" : "text-gray-700"
                  } ${active && !isLoggingOut ? "bg-gray-50" : ""}`}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>
                    {isLoggingOut ? (
                      <div className="flex items-center gap-2">
                        <span>Saindo...</span>
                        <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      "Logout"
                    )}
                  </span>
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
