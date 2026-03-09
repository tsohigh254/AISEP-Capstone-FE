"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "@/lib/useCountUp";

type Startup = {
  id: number;
  name: string;
  logo: string;
  stage: string;
  industry: string;
  location: string;
  fundingNeeds: string;
  aiScore: number;
  marketViabilityScore: number;
  teamScore: number;
  tractionMetrics: string;
  latestDocument: string;
  blockchainStatus: "Verified" | "Pending";
  foundingDate: string;
};

const startups: Startup[] = [
  {
    id: 1,
    name: "Innovate Solutions",
    logo: "🚀",
    stage: "SEED",
    industry: "AI/SaaS",
    location: "San Francisco, CA",
    fundingNeeds: "$500K",
    aiScore: 8.7,
    marketViabilityScore: 8.5,
    teamScore: 8.2,
    tractionMetrics: "10K Users, $50K MRR",
    latestDocument: "Pitch Deck (2 days ago)",
    blockchainStatus: "Verified",
    foundingDate: "Jan 2022",
  },
  {
    id: 2,
    name: "Quantum Leap Robotics",
    logo: "🤖",
    stage: "SERIES A",
    industry: "Robotics",
    location: "Boston, MA",
    fundingNeeds: "$2.5M",
    aiScore: 9.1,
    marketViabilityScore: 9,
    teamScore: 8.9,
    tractionMetrics: "5K Customers, $200K MRR",
    latestDocument: "Financials Q4 (1 week ago)",
    blockchainStatus: "Verified",
    foundingDate: "Mar 2021",
  },
  {
    id: 3,
    name: "Green Eco-Tech",
    logo: "🌱",
    stage: "PRE-SEED",
    industry: "Cleantech",
    location: "Seattle, WA",
    fundingNeeds: "$200K",
    aiScore: 7.9,
    marketViabilityScore: 7.8,
    teamScore: 7.5,
    tractionMetrics: "1K Users, $5K MRR",
    latestDocument: "Business Plan (1 month ago)",
    blockchainStatus: "Verified",
    foundingDate: "Aug 2022",
  },
];

export default function CompareStartupsPage() {
  const [selectedStartups, setSelectedStartups] = useState<Startup[]>(startups);

  const removeStartup = (id: number) => {
    setSelectedStartups(selectedStartups.filter((s) => s.id !== id));
  };

  return (
    <InvestorShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Compare Startups</h1>
        </div>

        {/* Selected Startups Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          {selectedStartups.map((startup) => (
            <div
              key={startup.id}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2"
            >
              <span className="text-lg">{startup.logo}</span>
              <span className="font-medium text-sm">{startup.name}</span>
              <button
                onClick={() => removeStartup(startup.id)}
                className="ml-1 text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            className="border-dashed border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            +Add Startup
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-1/5 px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Comparison Attribute
                  </th>
                  {selectedStartups.map((startup) => (
                    <th
                      key={startup.id}
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-700"
                    >
                      {startup.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Startup Name Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Startup Name
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center text-xl">
                          {startup.logo}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {startup.name}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Stage Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">Stage</td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4">
                      <Badge className="bg-cyan-400 text-white hover:bg-cyan-500 font-bold">
                        {startup.stage}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Industry Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Industry
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4 text-slate-900">
                      {startup.industry}
                    </td>
                  ))}
                </tr>

                {/* Location Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Location
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4 text-slate-900">
                      {startup.location}
                    </td>
                  ))}
                </tr>

                {/* Funding Needs Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Funding Needs
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4 font-semibold text-slate-900">
                      {startup.fundingNeeds}
                    </td>
                  ))}
                </tr>

                {/* AI Score Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    AI Score
                  </td>
                  {selectedStartups.map((startup, idx) => (
                    <td key={startup.id} className="px-6 py-4">
                      <AnimatedNumber
                        value={startup.aiScore * 10}
                        duration={1000}
                        delay={idx * 150}
                        format={(n) => (n / 10).toFixed(1)}
                        className="text-lg font-bold text-purple-600"
                      />
                    </td>
                  ))}
                </tr>

                {/* Market Viability Score Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Market Viability Score
                  </td>
                  {selectedStartups.map((startup, idx) => (
                    <td key={startup.id} className="px-6 py-4">
                      <AnimatedNumber
                        value={startup.marketViabilityScore * 10}
                        duration={1000}
                        delay={idx * 150 + 200}
                        format={(n) => (n / 10).toFixed(1)}
                        className="text-lg font-bold text-purple-600"
                      />
                    </td>
                  ))}
                </tr>

                {/* Team Score Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Team Score
                  </td>
                  {selectedStartups.map((startup, idx) => (
                    <td key={startup.id} className="px-6 py-4">
                      <AnimatedNumber
                        value={startup.teamScore * 10}
                        duration={1000}
                        delay={idx * 150 + 400}
                        format={(n) => (n / 10).toFixed(1)}
                        className="text-lg font-bold text-purple-600"
                      />
                    </td>
                  ))}
                </tr>

                {/* Traction Metrics Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Traction Metrics
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4 text-slate-900">
                      {startup.tractionMetrics}
                    </td>
                  ))}
                </tr>

                {/* Latest Document Upload Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Latest Document Upload
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4 text-slate-900">
                      {startup.latestDocument}
                    </td>
                  ))}
                </tr>

                {/* Blockchain Status Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Blockchain Status
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4">
                      <Badge
                        className={`${
                          startup.blockchainStatus === "Verified"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        } text-white hover:${
                          startup.blockchainStatus === "Verified"
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        } font-bold`}
                      >
                        {startup.blockchainStatus}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Founding Date Row */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    Founding Date
                  </td>
                  {selectedStartups.map((startup) => (
                    <td key={startup.id} className="px-6 py-4 text-slate-900">
                      {startup.foundingDate}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InvestorShell>
  );
}
