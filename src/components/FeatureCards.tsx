import Image from "next/image";

export function FeatureCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#0066FF] to-[#00E6CA] bg-clip-text text-transparent">
              One platform
            </span>{" "}
            <span className="text-[#1E293B]">for</span>
            <br />
            <span className="text-[#1E293B]">all your business finances</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need in one place
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Card 1 */}
          <div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
              Accounting made modern
            </h3>
            <p className="text-gray-600">
              Local or global, your accounting reimagined.
            </p>
          </div>

          {/* Card 2 */}
          <div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
              Complete financial control
            </h3>
            <p className="text-gray-600">
              Real-time cash flow and financial overview.
            </p>
          </div>

          {/* Card 3 */}
          <div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
              Effortless bank sync
            </h3>
            <p className="text-gray-600">Bank to accounting automation.</p>
          </div>

          {/* Card 4 */}
          <div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
              Take payments globally
            </h3>
            <p className="text-gray-600">
              Get paid by clients in any currency.
            </p>
          </div>

          {/* Card 5 */}
          <div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
              AI-powered reconciliation
            </h3>
            <p className="text-gray-600">
              Save up to 80% on reconciliation effort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
