"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, MapPin, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SearchStartups } from "@/services/investor/investor.api";

export default function InvestorStartupsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả lĩnh vực");
  const [selectedStage, setSelectedStage] = useState("Tất cả giai đoạn");
  const [searchQuery, setSearchQuery] = useState("");
  const [startups, setStartups] = useState<IStartupSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState<IPaging | null>(null);
  const pageSize = 20;

  const fetchStartups = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await SearchStartups(p, pageSize) as unknown as IBackendRes<IPaginatedRes<IStartupSearchItem>>;
      if (res.success && res.data) {
        setStartups(res.data.items);
        setPaging(res.data.paging);
      } else {
        setError(res.message || "Không thể tải danh sách startup.");
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartups(page);
  }, [page, fetchStartups]);

  // Client-side filtering
  const filtered = startups.filter((s) => {
    const matchSearch =
      !searchQuery ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.oneLiner?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "Tất cả lĩnh vực" || s.industry === selectedCategory;
    const matchStage =
      selectedStage === "Tất cả giai đoạn" || s.stage === selectedStage;
    return matchSearch && matchCategory && matchStage;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <InvestorShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Khám phá Startup</h1>
          <p className="text-slate-600 mt-1">Tìm kiếm và đánh giá các startup tiềm năng</p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm startup..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-slate-300"
            />
          </div>
          <select
            className="px-4 h-12 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>Tất cả lĩnh vực</option>
            <option>AI & Machine Learning</option>
            <option>FinTech</option>
            <option>HealthTech</option>
            <option>EdTech</option>
          </select>
          <select
            className="px-4 h-12 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option>Tất cả giai đoạn</option>
            <option>Pre-Seed</option>
            <option>Seed</option>
            <option>Series A</option>
            <option>Series B</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={() => fetchStartups(page)} className="ml-2 underline hover:no-underline">Thử lại</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải danh sách startup...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Không tìm thấy startup nào.</div>
        ) : (
          /* Startup Cards Grid */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
            {filtered.map((startup) => (
              <Card key={startup.startupID} className="hover:shadow-lg transition-shadow relative">
                <CardContent className="p-6">
                  {/* Logo and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    {startup.logoURL ? (
                      <img
                        src={startup.logoURL}
                        alt={startup.companyName}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xl">{getInitials(startup.companyName)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-slate-900 mb-1">
                        {startup.companyName}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {startup.oneLiner}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {startup.industry && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs px-3 py-1 font-medium">
                        {startup.industry}
                      </Badge>
                    )}
                    {startup.stage && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs px-3 py-1 font-medium">
                        {startup.stage}
                      </Badge>
                    )}
                    {startup.fundingStage && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs px-3 py-1 font-medium">
                        {startup.fundingStage}
                      </Badge>
                    )}
                  </div>

                  {/* Location */}
                  {startup.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{startup.location}{startup.country ? `, ${startup.country}` : ""}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {paging && paging.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-slate-300"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </Button>
            <span className="text-sm text-slate-600">
              Trang {paging.page} / {paging.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= paging.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-300"
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </InvestorShell>
  );
}


