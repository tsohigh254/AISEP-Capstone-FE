"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, Heart, Send, Clock, Bell } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { GetInvestorWatchlist } from "@/services/investor/investor.api";

export default function InvestorWatchlistPage() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [items, setItems] = useState<IWatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState<IPaging | null>(null);
  const pageSize = 20;

  const fetchWatchlist = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await GetInvestorWatchlist(p, pageSize) as unknown as IBackendRes<IPaginatedRes<IWatchlistItem>>;
      if (res.success && res.data) {
        setItems(res.data.items);
        setPaging(res.data.paging);
      } else {
        setError(res.message || "Không thể tải watchlist.");
      }
    } catch {
      setError("Có lỗi xảy ra khi tải watchlist. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist(page);
  }, [page, fetchWatchlist]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.watchlistID));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleRemoveFromWatchlist = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa startup này khỏi watchlist?")) {
      setItems(items.filter((item) => item.watchlistID !== id));
    }
  };

  return (
    <InvestorShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Watchlist</h1>
          <p className="text-slate-600 mt-1">Startup bạn đang theo dõi</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={() => fetchWatchlist(page)} className="ml-2 underline hover:no-underline">Thử lại</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant={showHistory ? "default" : "outline"}
              onClick={() => setShowHistory(!showHistory)}
              className={showHistory ? "bg-blue-600 text-white" : "border-slate-300 text-slate-700"}
            >
              <Clock className="w-4 h-4 mr-2" />
              {showHistory ? "Hiện watchlist hiện tại" : "Xem lịch sử watchlist"}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Watchlist Cards */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải watchlist...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Chưa có startup nào trong watchlist.</div>
        ) : !showHistory ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
            {items.map((item) => (
              <Card key={item.watchlistID} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300">
                  {item.logoURL ? (
                    <img
                      src={item.logoURL}
                      alt={item.companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                      {item.companyName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFromWatchlist(item.watchlistID)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:text-red-600"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">
                    {item.companyName}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {item.oneLiner}
                  </p>
                  {item.location && (
                    <p className="text-xs text-slate-500 mb-3">{item.location}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.industry && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs px-3 py-1">
                        {item.industry}
                      </Badge>
                    )}
                    {item.stage && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs px-3 py-1">
                        {item.stage}
                      </Badge>
                    )}
                    {item.priority && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs px-3 py-1">
                        {item.priority}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      Gửi đề nghị
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Lịch sử Watchlist</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.watchlistID} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded overflow-hidden flex items-center justify-center">
                        {item.logoURL ? (
                          <img src={item.logoURL} alt={item.companyName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-slate-400">{item.companyName?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">{item.companyName}</h4>
                        <p className="text-xs text-slate-600">Đã thêm: {new Date(item.addedAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.industry && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          {item.industry}
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        Đang theo dõi
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
            </Button>
          </div>
        )}
      </div>
    </InvestorShell>
  );
}


