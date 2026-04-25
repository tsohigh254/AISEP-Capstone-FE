"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  EyeOff,
  Filter,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Tags,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  CreateStaffIndustry,
  CreateStaffStage,
  DeleteStaffIndustry,
  DeleteStaffStage,
  GetStaffIndustries,
  GetStaffStages,
  IStaffIndustryItem,
  IStageMasterItem,
  UpdateStaffIndustry,
  UpdateStaffStage,
} from "@/services/master/master.api";

type Tab = "industries" | "stages";
type StatusFilter = "all" | "active" | "inactive";
type IndustryKindFilter = "all" | "parent" | "child";
type IndustryMode = "parent" | "child";

type IndustryRow = IStaffIndustryItem & {
  level: number;
  parentName?: string;
};

type IndustryForm = {
  id?: number;
  industryName: string;
  description: string;
  parentIndustryId: string;
  isActive: boolean;
};

type StageForm = {
  id?: number;
  stageName: string;
  description: string;
  orderIndex: string;
  isActive: boolean;
};

const emptyIndustryForm: IndustryForm = {
  industryName: "",
  description: "",
  parentIndustryId: "",
  isActive: true,
};

const emptyStageForm: StageForm = {
  stageName: "",
  description: "",
  orderIndex: "",
  isActive: true,
};

const fieldClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20";

const textareaClass =
  "min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20";
const MASTER_DATA_LOAD_ERROR_TOAST_ID = "staff-master-data-load-error";

function isActive(value?: boolean) {
  return value !== false;
}

function flattenIndustries(items: IStaffIndustryItem[]) {
  const rows: IndustryRow[] = [];

  const visit = (item: IStaffIndustryItem, level: number, parentName?: string) => {
    rows.push({ ...item, level, parentName });
    (item.subIndustries ?? []).forEach((child) => visit(child, level + 1, item.industryName));
  };

  items.forEach((item) => visit(item, 0));

  // BE can return partially-flattened trees where parentIndustryId exists
  // but parentName isn't reachable via nested subIndustries; fill it by id lookup.
  const nameById = new Map<number, string>();
  rows.forEach((row) => {
    nameById.set(row.industryId, row.industryName);
  });

  return rows.map((row) => ({
    ...row,
    parentName:
      row.parentName ??
      (row.parentIndustryId != null ? nameById.get(row.parentIndustryId) : undefined),
  }));
}

function StatusPill({ active }: { active?: boolean }) {
  const enabled = isActive(active);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold",
        enabled
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      )}
    >
      {enabled ? <CheckCircle2 className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {enabled ? "Đang dùng" : "Đã ẩn khỏi public"}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: "slate" | "amber" | "rose" | "emerald";
}) {
  const toneClass = {
    slate: "bg-slate-50 text-slate-500",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div className={cn("flex size-8 items-center justify-center rounded-xl", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-[22px] font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[12px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export default function StaffMasterDataPage() {
  const [tab, setTab] = useState<Tab>("industries");
  const [industries, setIndustries] = useState<IStaffIndustryItem[]>([]);
  const [stages, setStages] = useState<IStageMasterItem[]>([]);
  const [industryForm, setIndustryForm] = useState<IndustryForm>(emptyIndustryForm);
  const [industryMode, setIndustryMode] = useState<IndustryMode>("parent");
  const [stageForm, setStageForm] = useState<StageForm>(emptyStageForm);
  const [showIndustryForm, setShowIndustryForm] = useState(false);
  const [showStageForm, setShowStageForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [industryKindFilter, setIndustryKindFilter] = useState<IndustryKindFilter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: (() => Promise<void> | void) | undefined;
  }>({ open: false });
  const [confirmProcessing, setConfirmProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const flatIndustries = useMemo(() => flattenIndustries(industries), [industries]);
  const parentOptions = flatIndustries.filter((item) => !item.parentIndustryId);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [industryItems, stageItems] = await Promise.all([GetStaffIndustries(), GetStaffStages()]);
      setIndustries(industryItems);
      setStages(stageItems);
    } catch {
      toast.error("Không tải được danh mục master data.", {
        id: MASTER_DATA_LOAD_ERROR_TOAST_ID,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeIndustryCount = flatIndustries.filter((item) => isActive(item.isActive)).length;
  const inactiveIndustryCount = flatIndustries.length - activeIndustryCount;
  const parentIndustryCount = flatIndustries.filter((item) => !item.parentIndustryId).length;
  const subIndustryCount = flatIndustries.length - parentIndustryCount;

  const activeStageCount = stages.filter((item) => isActive(item.isActive)).length;
  const inactiveStageCount = stages.length - activeStageCount;
  const maxOrder = stages.reduce((max, item) => Math.max(max, item.orderIndex ?? 0), 0);

  const normalizedSearch = search.trim().toLowerCase();
  const hasActiveFilters =
    Boolean(normalizedSearch) ||
    statusFilter !== "all" ||
    (tab === "industries" && industryKindFilter !== "all");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onEscapeCloseForm = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (showIndustryForm) resetIndustryForm();
      if (showStageForm) resetStageForm();
    };

    window.addEventListener("keydown", onEscapeCloseForm);
    return () => window.removeEventListener("keydown", onEscapeCloseForm);
  }, [showIndustryForm, showStageForm]);

  useEffect(() => {
    const shouldLockScroll = showIndustryForm || showStageForm || confirmModal.open;
    if (!shouldLockScroll) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showIndustryForm, showStageForm, confirmModal.open]);

  const visibleIndustries = useMemo(() => {
    return flatIndustries.filter((item) => {
      const active = isActive(item.isActive);
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? active : !active);
      const matchesKind =
        industryKindFilter === "all" ||
        (industryKindFilter === "parent" ? !item.parentIndustryId : Boolean(item.parentIndustryId));
      const matchesSearch =
        !normalizedSearch ||
        item.industryName.toLowerCase().includes(normalizedSearch) ||
        (item.description ?? "").toLowerCase().includes(normalizedSearch) ||
        (item.parentName ?? "").toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesKind && matchesSearch;
    });
  }, [flatIndustries, industryKindFilter, normalizedSearch, statusFilter]);

  const visibleStages = useMemo(() => {
    return stages
      .filter((item) => {
        const active = isActive(item.isActive);
        const matchesStatus =
          statusFilter === "all" || (statusFilter === "active" ? active : !active);
        const matchesSearch =
          !normalizedSearch ||
          item.stageName.toLowerCase().includes(normalizedSearch) ||
          (item.description ?? "").toLowerCase().includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => (a.orderIndex ?? 9999) - (b.orderIndex ?? 9999));
  }, [normalizedSearch, stages, statusFilter]);

  const resetIndustryForm = () => {
    setIndustryForm(emptyIndustryForm);
    setIndustryMode("parent");
    setShowIndustryForm(false);
  };

  const resetStageForm = () => {
    setStageForm(emptyStageForm);
    setShowStageForm(false);
  };

  const startCreate = () => {
    if (tab === "industries") {
      setIndustryForm(emptyIndustryForm);
      setIndustryMode("parent");
      setShowIndustryForm(true);
      return;
    }

    setStageForm({
      ...emptyStageForm,
      orderIndex: maxOrder ? String(maxOrder + 1) : "",
    });
    setShowStageForm(true);
  };

  const editIndustry = (item: IStaffIndustryItem) => {
    const mode: IndustryMode = item.parentIndustryId ? "child" : "parent";
    setIndustryForm({
      id: item.industryId,
      industryName: item.industryName,
      description: item.description ?? "",
      parentIndustryId: item.parentIndustryId ? String(item.parentIndustryId) : "",
      isActive: isActive(item.isActive),
    });
    setIndustryMode(mode);
    setShowIndustryForm(true);
  };

  const editStage = (item: IStageMasterItem) => {
    setStageForm({
      id: item.stageId,
      stageName: item.stageName,
      description: item.description ?? "",
      orderIndex: item.orderIndex != null ? String(item.orderIndex) : "",
      isActive: isActive(item.isActive),
    });
    setShowStageForm(true);
  };

  // Helpers to manipulate industry tree in local state
  const removeIndustryById = (items: IStaffIndustryItem[], id: number): IStaffIndustryItem[] => {
    return items
      .map((it) => ({ ...it, subIndustries: it.subIndustries ? removeIndustryById(it.subIndustries, id) : [] }))
      .filter((it) => it.industryId !== id);
  };

  const insertIndustryIntoTree = (items: IStaffIndustryItem[], node: IStaffIndustryItem): IStaffIndustryItem[] => {
    if (!node.parentIndustryId) {
      return [...items, node];
    }

    let inserted = false;

    const walk = (list: IStaffIndustryItem[]): IStaffIndustryItem[] =>
      list.map((it) => {
        if (it.industryId === node.parentIndustryId) {
          inserted = true;
          return { ...it, subIndustries: [...(it.subIndustries ?? []), node] };
        }
        if (it.subIndustries && it.subIndustries.length) {
          return { ...it, subIndustries: walk(it.subIndustries) };
        }
        return it;
      });

    const result = walk(items);
    if (!inserted) return [...items, node];
    return result;
  };

  const saveIndustry = async () => {
    const name = industryForm.industryName.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên ngành.");
      return;
    }
    if (industryMode === "child" && !industryForm.parentIndustryId) {
      toast.error("Vui lòng chọn ngành cha cho ngành phụ.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        industryName: name,
        description: industryForm.description.trim() || undefined,
        parentIndustryId:
          industryMode === "child" && industryForm.parentIndustryId
            ? Number(industryForm.parentIndustryId)
            : null,
        isActive: industryForm.isActive,
      };

      // Create or update and update local state using returned DTO from API
      if (industryForm.id) {
        const updated = await UpdateStaffIndustry(industryForm.id, payload as any);
        setIndustries((prev) => {
          // remove any existing node with same id then insert updated node into correct parent
          const without = removeIndustryById(prev, updated.industryId);
          return insertIndustryIntoTree(without, updated);
        });
        toast.success("Đã cập nhật ngành.");
      } else {
        const created = await CreateStaffIndustry(payload as any);
        setIndustries((prev) => insertIndustryIntoTree(prev, created));
        toast.success("Đã tạo ngành mới.");
      }

      // Ensure UI reflects backend ordering and immediately highlights created/updated item.
      await loadData();
      setSearch("");
      setStatusFilter("all");
      setIndustryKindFilter("all");

      resetIndustryForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không lưu được ngành.");
    } finally {
      setSaving(false);
    }
  };

  const saveStage = async () => {
    const name = stageForm.stageName.trim();
    const orderIndex = stageForm.orderIndex ? Number(stageForm.orderIndex) : undefined;
    if (!name) {
      toast.error("Vui lòng nhập tên giai đoạn.");
      return;
    }
    if (orderIndex != null && (!Number.isFinite(orderIndex) || orderIndex < 0)) {
      toast.error("Thứ tự hiển thị phải là số hợp lệ.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        stageName: name,
        description: stageForm.description.trim() || undefined,
        orderIndex,
        isActive: stageForm.isActive,
      };

      if (stageForm.id) {
        const updated = await UpdateStaffStage(stageForm.id, payload as any);
        setStages((prev) => prev.map((s) => (s.stageId === updated.stageId ? updated : s)));
        toast.success("Đã cập nhật giai đoạn.");
      } else {
        const created = await CreateStaffStage(payload as any);
        setStages((prev) => [...prev, created]);
        toast.success("Đã tạo giai đoạn mới.");
      }

      resetStageForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không lưu được giai đoạn.");
    } finally {
      setSaving(false);
    }
  };

  const hideIndustry = async (item: IStaffIndustryItem) => {
    const counts = (item.startupCount || item.investorCount) ? ` (${item.startupCount ?? 0} startup, ${item.investorCount ?? 0} investor đang dùng)` : "";
    setConfirmModal({
      open: true,
      title: "Xác nhận ẩn khỏi danh mục public",
      message: `Ẩn ngành "${item.industryName}" khỏi danh mục public?${counts} Bản ghi vẫn được giữ trong hệ thống và có thể hiển thị lại.`,
      confirmLabel: "Ẩn khỏi public",
      onConfirm: async () => {
        setBusyKey(`industry-${item.industryId}`);
        try {
          const res = await DeleteStaffIndustry(item.industryId);
          toast.success((res as any)?.message || "Đã ẩn ngành khỏi public.");
          await loadData();
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Không ẩn ngành khỏi public được.");
        } finally {
          setBusyKey(null);
        }
      },
    });
  };

  const restoreIndustry = async (item: IStaffIndustryItem) => {
    setBusyKey(`industry-${item.industryId}`);
    try {
      await UpdateStaffIndustry(item.industryId, {
        industryName: item.industryName,
        description: item.description,
        parentIndustryId: item.parentIndustryId ?? null,
        isActive: true,
      });
      toast.success("Đã hiển thị lại ngành trên danh mục public.");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không hiển thị lại ngành được.");
    } finally {
      setBusyKey(null);
    }
  };

  const hideStage = async (item: IStageMasterItem) => {
    setConfirmModal({
      open: true,
      title: "Xác nhận ẩn khỏi danh mục public",
      message: `Ẩn giai đoạn "${item.stageName}" khỏi danh mục public? Bản ghi vẫn được giữ trong hệ thống và có thể hiển thị lại.`,
      confirmLabel: "Ẩn khỏi public",
      onConfirm: async () => {
        setBusyKey(`stage-${item.stageId}`);
        try {
          const res = await DeleteStaffStage(item.stageId);
          toast.success((res as any)?.message || "Đã ẩn giai đoạn khỏi public.");
          await loadData();
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Không ẩn giai đoạn khỏi public được.");
        } finally {
          setBusyKey(null);
        }
      },
    });
  };

  const restoreStage = async (item: IStageMasterItem) => {
    setBusyKey(`stage-${item.stageId}`);
    try {
      await UpdateStaffStage(item.stageId, {
        stageName: item.stageName,
        description: item.description,
        orderIndex: item.orderIndex,
        isActive: true,
      });
      toast.success("Đã hiển thị lại giai đoạn trên danh mục public.");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không hiển thị lại giai đoạn được.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirmModal.onConfirm) {
      setConfirmModal({ open: false });
      return;
    }

    setConfirmProcessing(true);
    try {
      await confirmModal.onConfirm();
    } catch (err) {
      // errors are handled inside onConfirm where appropriate
    } finally {
      setConfirmProcessing(false);
      setConfirmModal({ open: false });
    }
  };

  const activeTabCount = tab === "industries" ? visibleIndustries.length : visibleStages.length;
  const showingForm = tab === "industries" ? showIndustryForm : showStageForm;
  const withPortal = (node: React.ReactNode) => (mounted ? createPortal(node, document.body) : null);

  return (
    <div className="space-y-6 px-8 py-7 pb-16 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 font-plus-jakarta-sans text-[20px] font-bold tracking-tight text-slate-900">
            <Tags className="h-5 w-5 text-[#eec54e]" />
            Quản lý danh mục dữ liệu
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] text-slate-500">
            Quản lý ngành nghề, ngành phụ và giai đoạn đang dùng cho dropdown Startup, Investor và bộ lọc tìm kiếm.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading || saving || Boolean(busyKey)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tab === "industries" ? (
          <>
            <StatCard label="Tổng ngành" value={flatIndustries.length} icon={Tags} />
            <StatCard label="Ngành cha" value={parentIndustryCount} icon={Filter} tone="amber" />
            <StatCard label="Ngành phụ" value={subIndustryCount} icon={Layers3} tone="emerald" />
            <StatCard label="Đang ẩn" value={inactiveIndustryCount} icon={EyeOff} tone={inactiveIndustryCount ? "rose" : "slate"} />
          </>
        ) : (
          <>
            <StatCard label="Tổng giai đoạn" value={stages.length} icon={Layers3} />
            <StatCard label="Đang dùng" value={activeStageCount} icon={CheckCircle2} tone="emerald" />
            <StatCard label="Đã ẩn" value={inactiveStageCount} icon={EyeOff} tone={inactiveStageCount ? "rose" : "slate"} />
            <StatCard label="Thứ tự cao nhất" value={maxOrder || "-"} icon={Filter} tone="amber" />
          </>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50/60 p-1">
            {[
              { id: "industries" as const, label: "Ngành nghề", icon: Tags },
              { id: "stages" as const, label: "Giai đoạn", icon: Layers3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setSearch("");
                    setStatusFilter("all");
                    setIndustryKindFilter("all");
                  }}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-bold transition-all",
                    tab === item.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tab === "industries" ? "Tìm theo tên ngành, mô tả hoặc ngành cha..." : "Tìm theo tên giai đoạn hoặc mô tả..."}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-3 text-[13px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-600 outline-none transition-all focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang dùng</option>
              <option value="inactive">Đã ẩn</option>
            </select>

            {tab === "industries" && (
              <select
                value={industryKindFilter}
                onChange={(event) => setIndustryKindFilter(event.target.value as IndustryKindFilter)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-600 outline-none transition-all focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20"
              >
                <option value="all">Tất cả cấp</option>
                <option value="parent">Ngành cha</option>
                <option value="child">Ngành phụ</option>
              </select>
            )}

            <button
              type="button"
              onClick={startCreate}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-[13px] font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {tab === "industries" ? "Thêm ngành" : "Thêm giai đoạn"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-500">
          <span className="rounded-lg bg-slate-50 px-2.5 py-1">{activeTabCount} kết quả</span>
          {showingForm && <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-700">Đang mở form chỉnh sửa</span>}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setIndustryKindFilter("all");
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 transition hover:bg-slate-50"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!!normalizedSearch && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-slate-600"
              >
                Từ khóa: {search}
                <X className="h-3 w-3" />
              </button>
            )}
            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-slate-600"
              >
                Trạng thái: {statusFilter === "active" ? "Đang dùng" : "Đã ẩn"}
                <X className="h-3 w-3" />
              </button>
            )}
            {tab === "industries" && industryKindFilter !== "all" && (
              <button
                type="button"
                onClick={() => setIndustryKindFilter("all")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-slate-600"
              >
                Cấp: {industryKindFilter === "parent" ? "Ngành cha" : "Ngành phụ"}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {tab === "industries" &&
        showIndustryForm &&
        withPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng form sửa ngành"
            onClick={resetIndustryForm}
            className="absolute inset-0 bg-black/35"
          />
          <section className="relative z-10 w-full max-w-5xl max-h-[86vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {industryForm.id ? "Sửa ngành" : "Thêm ngành mới"}
              </h2>
              <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                Chọn rõ loại ngành để tránh nhầm thao tác: ngành cha là cấp cao nhất, ngành phụ sẽ nằm trong một ngành cha.
              </p>
            </div>
            <button
              type="button"
              onClick={resetIndustryForm}
              className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-2">
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Loại ngành</p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setIndustryMode("parent");
                  setIndustryForm((prev) => ({ ...prev, parentIndustryId: "" }));
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                  industryMode === "parent"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Ngành cha
              </button>
              <button
                type="button"
                onClick={() => setIndustryMode("child")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                  industryMode === "child"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Ngành phụ
              </button>
            </div>
          </div>

          <div className={cn("grid gap-3 lg:items-end", industryMode === "child" ? "lg:grid-cols-[1fr_1fr_1.2fr_auto]" : "lg:grid-cols-[1.2fr_1.6fr_auto]")}>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-slate-500">Tên ngành</label>
              <input
                className={fieldClass}
                value={industryForm.industryName}
                onChange={(event) => setIndustryForm((prev) => ({ ...prev, industryName: event.target.value }))}
                placeholder="Ví dụ: FinTech"
              />
            </div>

            {industryMode === "child" && (
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-slate-500">
                  Ngành cha <span className="text-rose-500">*</span>
                </label>
                <select
                  className={fieldClass}
                  value={industryForm.parentIndustryId}
                  onChange={(event) => setIndustryForm((prev) => ({ ...prev, parentIndustryId: event.target.value }))}
                >
                  <option value="">Chọn ngành cha</option>
                  {parentOptions
                    .filter((item) => item.industryId !== industryForm.id)
                    .map((item) => (
                      <option key={item.industryId} value={item.industryId}>
                        {item.industryName}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-slate-500">Mô tả nội bộ (tùy chọn)</label>
              <input
                className={fieldClass}
                value={industryForm.description}
                onChange={(event) => setIndustryForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Dùng để staff nhận biết nhanh trong trang quản trị"
              />
            </div>

            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-600">
              <input
                type="checkbox"
                checked={industryForm.isActive}
                onChange={(event) => setIndustryForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                className="h-4 w-4 accent-slate-900"
              />
              Đang dùng
            </label>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[12px] font-semibold text-slate-600">
            Bạn sắp {industryForm.id ? "cập nhật" : "tạo"}:{" "}
            <span className="font-bold text-slate-900">
              {industryMode === "parent"
                ? `Ngành cha${industryForm.industryName.trim() ? ` - ${industryForm.industryName.trim()}` : ""}`
                : `Ngành phụ${
                    industryForm.parentIndustryId
                      ? ` thuộc ${
                          parentOptions.find((it) => String(it.industryId) === industryForm.parentIndustryId)
                            ?.industryName ?? "ngành cha đã chọn"
                        }`
                      : ""
                  }${industryForm.industryName.trim() ? ` - ${industryForm.industryName.trim()}` : ""}`}
            </span>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetIndustryForm}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={saveIndustry}
              disabled={saving || (industryMode === "child" && !industryForm.parentIndustryId)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {industryForm.id ? "Lưu thay đổi" : industryMode === "parent" ? "Tạo ngành cha" : "Tạo ngành phụ"}
            </button>
          </div>
          </section>
        </div>
      )}

      {tab === "stages" &&
        showStageForm &&
        withPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng form sửa giai đoạn"
            onClick={resetStageForm}
            className="absolute inset-0 bg-black/35"
          />
          <section className="relative z-10 w-full max-w-4xl max-h-[86vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {stageForm.id ? "Sửa giai đoạn" : "Thêm giai đoạn mới"}
              </h2>
              <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                Thứ tự hiển thị quyết định vị trí của giai đoạn trong dropdown public.
              </p>
            </div>
            <button
              type="button"
              onClick={resetStageForm}
              className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_160px_1.5fr_auto] lg:items-end">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-slate-500">Tên giai đoạn</label>
              <input
                className={fieldClass}
                value={stageForm.stageName}
                onChange={(event) => setStageForm((prev) => ({ ...prev, stageName: event.target.value }))}
                placeholder="Ví dụ: Seed"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-slate-500">Thứ tự hiển thị</label>
              <input
                className={fieldClass}
                inputMode="numeric"
                value={stageForm.orderIndex}
                onChange={(event) => setStageForm((prev) => ({ ...prev, orderIndex: event.target.value.replace(/[^\d]/g, "") }))}
                placeholder="1"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-slate-500">Mô tả</label>
              <input
                className={fieldClass}
                value={stageForm.description}
                onChange={(event) => setStageForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Mô tả ngắn về giai đoạn"
              />
            </div>

            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-600">
              <input
                type="checkbox"
                checked={stageForm.isActive}
                onChange={(event) => setStageForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                className="h-4 w-4 accent-slate-900"
              />
              Đang dùng
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetStageForm}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={saveStage}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {stageForm.id ? "Lưu thay đổi" : "Tạo giai đoạn"}
            </button>
          </div>
          </section>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              {tab === "industries" ? "Danh sách ngành" : "Danh sách giai đoạn"}
            </h2>
            <p className="mt-1 text-[12px] font-medium text-slate-400">
              {tab === "industries"
                ? "Danh sách gồm cả bản ghi đã ẩn để nhân viên có thể bật lại khi cần."
                : "Giai đoạn đang dùng sẽ xuất hiện trong dropdown public theo đúng thứ tự hiển thị."}
            </p>
          </div>

          {tab === "industries" && inactiveIndustryCount > 0 && (
            <div className="inline-flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Có {inactiveIndustryCount} ngành đang bị ẩn khỏi danh mục public.
            </div>
          )}
          {tab === "stages" && inactiveStageCount > 0 && (
            <div className="inline-flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Có {inactiveStageCount} giai đoạn đang bị ẩn khỏi danh mục public.
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#eec54e]" />
          </div>
        ) : tab === "industries" ? (
          <div className="max-h-[68vh] overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-[2] bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-3">Tên ngành</th>
                  <th className="px-5 py-3">Cấp</th>
                  <th className="px-5 py-3">Ngành cha</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleIndustries.map((item, index) => {
                  const rowBusy = busyKey === `industry-${item.industryId}`;
                  const rowActive = isActive(item.isActive);
                  const editing = industryForm.id === item.industryId && showIndustryForm;

                  return (
                    <tr
                      key={item.industryId}
                      className={cn(
                        "transition hover:bg-slate-50/70",
                        index % 2 === 1 && "bg-slate-50/20",
                        editing && "bg-amber-50/40"
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2" style={{ paddingLeft: item.level * 18 }}>
                          <p className="text-[13px] font-bold text-slate-900">{item.industryName}</p>
                          {item.level > 0 && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              Phụ
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 line-clamp-1 text-[12px] font-medium text-slate-400">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold",
                            item.parentIndustryId ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {item.parentIndustryId ? "Ngành phụ" : "Ngành cha"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] font-semibold text-slate-500">
                        {item.parentName ?? "-"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill active={item.isActive} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => editIndustry(item)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-[12px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                            title="Sửa"
                          >
                            <Edit3 className="h-4 w-4" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => (rowActive ? hideIndustry(item) : restoreIndustry(item))}
                            disabled={rowBusy}
                            className={cn(
                              "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-bold transition disabled:opacity-50",
                              rowActive
                                ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                                : "border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                            )}
                          >
                            {rowBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : rowActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                            {rowActive ? "Ẩn khỏi public" : "Hiển thị lại"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleIndustries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <p className="text-[13px] font-bold text-slate-500">Không có ngành phù hợp.</p>
                      <p className="mt-1 text-[12px] text-slate-400">Thử đổi bộ lọc hoặc tạo ngành mới.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="max-h-[68vh] overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-[2] bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-3">Giai đoạn</th>
                  <th className="px-5 py-3">Thứ tự</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStages.map((item, index) => {
                  const rowBusy = busyKey === `stage-${item.stageId}`;
                  const rowActive = isActive(item.isActive);
                  const editing = stageForm.id === item.stageId && showStageForm;

                  return (
                    <tr
                      key={item.stageId}
                      className={cn(
                        "transition hover:bg-slate-50/70",
                        index % 2 === 1 && "bg-slate-50/20",
                        editing && "bg-amber-50/40"
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-bold text-slate-900">{item.stageName}</p>
                        {item.description && (
                          <p className="mt-1 line-clamp-1 text-[12px] font-medium text-slate-400">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex min-w-9 justify-center rounded-lg bg-slate-50 px-2.5 py-1 text-[12px] font-bold text-slate-600">
                          {item.orderIndex ?? "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill active={item.isActive} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => editStage(item)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-[12px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                            title="Sửa"
                          >
                            <Edit3 className="h-4 w-4" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => (rowActive ? hideStage(item) : restoreStage(item))}
                            disabled={rowBusy}
                            className={cn(
                              "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-bold transition disabled:opacity-50",
                              rowActive
                                ? "border-rose-100 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                            )}
                          >
                            {rowBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : rowActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                            {rowActive ? "Ẩn khỏi public" : "Hiển thị lại"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleStages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-14 text-center">
                      <p className="text-[13px] font-bold text-slate-500">Không có giai đoạn phù hợp.</p>
                      <p className="mt-1 text-[12px] text-slate-400">Thử đổi bộ lọc hoặc tạo giai đoạn mới.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirmModal.open &&
        withPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmModal({ open: false })}
          />

          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-[16px] font-bold text-slate-900">{confirmModal.title}</h3>
            <p className="mt-2 text-[13px] text-slate-600">{confirmModal.message}</p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false })}
                disabled={confirmProcessing}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirmProcessing}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {confirmProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{confirmModal.confirmLabel ?? "Xác nhận"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
