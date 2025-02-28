import React, { useState } from "react";

export function InsightsAndCTA() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");

  const clients = [
    {
      id: 1,
      name: "Quantum Dynamics",
      logo: "https://public.readdy.ai/ai/img_res/8b01d9c46471081bb69072064c2b18e4.jpg",
      location: "Singapore (GMT+8)",
      status: "Active",
      fiscalYear: "12.31",
    },
    {
      id: 2,
      name: "EcoVentures Global",
      logo: "https://public.readdy.ai/ai/img_res/edc5c30cf2511a57d45022b9741474e8.jpg",
      location: "London (GMT)",
      status: "Active",
      fiscalYear: "03.31",
    },
    {
      id: 3,
      name: "TechFusion Systems",
      logo: "https://public.readdy.ai/ai/img_res/9b8c7c2421cb7a9d2e014a4aa113e2b0.jpg",
      location: "New York (GMT-4)",
      status: "Active",
      fiscalYear: "12.31",
    },
  ];

  const insights = [
    {
      id: 1,
      title: "Revolutionizing Financial Management with AI",
      category: "PRODUCT NEWS",
      readTime: "4 MIN READ TIME",
      image:
        "https://public.readdy.ai/ai/img_res/6784fa0d85e93a7504ea87f675e50ff7.jpg",
    },
    {
      id: 2,
      title: "The Future of Cloud Accounting Solutions",
      category: "INDUSTRY INSIGHTS",
      readTime: "5 MIN READ TIME",
      image:
        "https://public.readdy.ai/ai/img_res/c8b95f71835709971d4f1a76680862dd.jpg",
    },
    {
      id: 3,
      title: "Streamlining Business Operations",
      category: "CASE STUDIES",
      readTime: "3 MIN READ TIME",
      image:
        "https://public.readdy.ai/ai/img_res/e0179a7dca4648a9e569ecc55c68c919.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://public.readdy.ai/ai/img_res/bc9e7eb74adf4562693914b57f023236.jpg"
            className="w-full h-full object-cover"
            alt="Hero background"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Pioneering accountants,
            <br />
            transform your practice today
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Simplify the complex-automate with Fiskl AI
          </p>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button className="border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 !rounded-button whitespace-nowrap">
                {selectedStatus}
                <i className="fas fa-chevron-down text-gray-500"></i>
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 !rounded-button whitespace-nowrap">
                Create
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg !rounded-button whitespace-nowrap">
                Invite
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">
                    CLIENT
                  </th>
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">
                    LOCATION
                  </th>
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">
                    STATUS
                  </th>
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">
                    FISCAL YEAR END
                  </th>
                  <th className="py-4 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={client.logo}
                          alt={client.name}
                          className="w-10 h-10 rounded-lg"
                        />
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {client.location}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {client.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {client.fiscalYear}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-purple-600 px-4 py-1 rounded-lg !rounded-button whitespace-nowrap">
                        Go to
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Insights on <span className="text-blue-500">AI</span> and modern
          accounting
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={insight.image}
                alt={insight.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm text-gray-500">
                    {insight.category}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    {insight.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{insight.title}</h3>
                <button className="text-purple-600 font-medium !rounded-button whitespace-nowrap">
                  Read more
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Build a beautiful relationship with
            <br />
            your finances today
          </h2>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium !rounded-button whitespace-nowrap">
            Start now
          </button>
        </div>
      </div>
    </div>
  );
}
