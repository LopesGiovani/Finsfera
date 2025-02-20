import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  UserIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export function UserMenu() {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-800 text-sm">
          GL
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
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-800">
                GL
              </div>
              <div>
                <div className="font-medium">giovani oliveira lopes filho</div>
                <div className="text-sm text-gray-500">
                  giovanioliveiramcp@gmail.com
                </div>
              </div>
            </div>

            {/* Refer & Earn */}
            <Link
              href="#"
              className="flex items-center gap-3 p-3 mb-2 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-blue-600">Refer & Earn</div>
                <div className="text-sm text-gray-600">
                  Invite friends and get rewarded
                </div>
              </div>
            </Link>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <Bars3Icon className="w-5 h-5" />
                  <span>User Settings</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/support"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                  <span>Contact Support</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/knowledge-base"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <MapPinIcon className="w-5 h-5" />
                  <span>Knowledge Base</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/whats-new"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <MegaphoneIcon className="w-5 h-5" />
                  <span>What's New?</span>
                </Link>
              )}
            </Menu.Item>

            <div className="border-t my-2" />

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/terms"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Terms of Service</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/privacy"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Privacy Policy</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
