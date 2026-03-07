"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Sparkles, Eye, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { GetRecommendations } from "@/services/investor/investor.api";

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<IStartupSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStartup, setSelectedStartup] = useState<IStartupSearchItem | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await GetRecommendations() as unknown as IBackendRes<any>;
      if (res.success && res.data) {
        // Handle both plain array and paginated { items: [...] } shapes
        const items: IStartupSearchItem[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.items)
            ? res.data.items
            : [];
        setRecommendations(items);
      } else if (res.error?.code === "501" || res.message?.toLowerCase().includes("not implemented")) {
        setError("Tính năng gợi ý AI đang được phát triển. Vui lòng quay lại sau.");
      } else {
        setError(res.message || res.error?.message || "Không thể tải gợi ý.");
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const filtered = recommendations.filter((s) =>
    !searchQuery ||
    s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.oneLiner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  return (
    <InvestorShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Recommendations</h1>
          <p className="text-slate-600 mt-1">
            Startup được AI gợi ý dựa trên portfolio và preferences
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-4xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm startup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 border-slate-300"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={fetchRecommendations} className="ml-2 underline hover:no-underline">Thử lại</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải gợi ý...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            {searchQuery ? "Không tìm thấy startup phù hợp." : "Chưa có gợi ý nào từ AI."}
          </div>
        ) : (
          /* Recommendations Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((rec) => (
              <Card
                key={rec.startupID}
                className="hover:shadow-lg transition-shadow relative group"
              >
                <CardContent className="p-6">
                  {/* Eye Icon on Hover */}
                  <div
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => setSelectedStartup(rec)}
                  >
                    <Eye className="w-5 h-5 text-slate-600" />
                  </div>

                  {/* Header with Logo and Info */}
                  <div className="flex items-start gap-4 mb-4">
                    {rec.logoURL ? (
                      <img
                        src={rec.logoURL}
                        alt={rec.companyName}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xl">{getInitials(rec.companyName)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-slate-900 mb-2">
                        {rec.companyName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        {rec.industry && <span>{rec.industry}</span>}
                        {rec.industry && rec.stage && <span>•</span>}
                        {rec.stage && <span>{rec.stage}</span>}
                      </div>
                      {rec.location && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{rec.location}{rec.country ? `, ${rec.country}` : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.fundingStage && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs px-3 py-1 font-medium">
                        {rec.fundingStage}
                      </Badge>
                    )}
                    {rec.subIndustry && (
                      <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 text-xs px-3 py-1 font-medium">
                        {rec.subIndustry}
                      </Badge>
                    )}
                    <Badge className="bg-green-500 text-white hover:bg-green-500 border-0 px-3 py-1.5 text-sm font-semibold">
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI Recommended
                    </Badge>
                  </div>

                  {/* One-liner */}
                  {rec.oneLiner && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {rec.oneLiner}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Startup Detail Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start gap-4">
                {selectedStartup.logoURL ? (
                  <img
                    src={selectedStartup.logoURL}
                    alt={selectedStartup.companyName}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-2xl">
                      {getInitials(selectedStartup.companyName)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {selectedStartup.companyName}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedStartup.industry && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                        {selectedStartup.industry}
                      </Badge>
                    )}
                    {selectedStartup.stage && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">
                        {selectedStartup.stage}
                      </Badge>
                    )}
                    {selectedStartup.fundingStage && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                        {selectedStartup.fundingStage}
                      </Badge>
                    )}
                  </div>
                  {selectedStartup.location && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedStartup.location}{selectedStartup.country ? `, ${selectedStartup.country}` : ""}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedStartup(null)}
                  className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* About */}
              {selectedStartup.oneLiner && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">About</h3>
                  <p className="text-slate-600 leading-relaxed">{selectedStartup.oneLiner}</p>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                {selectedStartup.industry && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Industry</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedStartup.industry}</div>
                  </div>
                )}
                {selectedStartup.subIndustry && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Sub-Industry</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedStartup.subIndustry}</div>
                  </div>
                )}
                {selectedStartup.stage && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Stage</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedStartup.stage}</div>
                  </div>
                )}
                {selectedStartup.fundingStage && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Funding Stage</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedStartup.fundingStage}</div>
                  </div>
                )}
                {selectedStartup.profileStatus && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Status</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedStartup.profileStatus}</div>
                  </div>
                )}
                {selectedStartup.country && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Country</div>
                    <div className="text-lg font-semibold text-slate-900">{selectedStartup.country}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </InvestorShell>
  );
}
