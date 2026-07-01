"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Star, Trash2, Upload, Download, Check, X, Save, Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { useFetch } from "@/hooks/useCmsData";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Language {
  id: number;
  code: string;
  name: string;
  native_name: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

interface LangForm {
  code: string;
  name: string;
  nativeName: string;
  sortOrder: number;
}

interface ModuleInfo {
  key: string;
  label: string;
  fields: string[];
}

interface ExportRow {
  module: string;
  entity_id: number;
  field: string;
  locale: string;
  source_value: string;
  value: string;
}

const EMPTY_FORM: LangForm = { code: "", name: "", nativeName: "", sortOrder: 0 };

export default function LanguagesAdminPage() {
  const { data: langs, loading, refetch } = useFetch<Language[]>("/admin/languages");

  const [form, setForm] = useState<LangForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function handleSave() {
    if (!form) return;
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Nhập mã và tên ngôn ngữ");
      return;
    }
    setSaving(true);
    try {
      await api.post("/admin/languages", {
        code: form.code.trim().toLowerCase(),
        name: form.name.trim(),
        nativeName: form.nativeName.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
      });
      toast.success("Đã thêm ngôn ngữ");
      setForm(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(lang: Language) {
    try {
      await api.patch(`/admin/languages/${lang.id}`, { isActive: !lang.is_active });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cập nhật thất bại");
    }
  }

  async function makeDefault(lang: Language) {
    try {
      await api.post(`/admin/languages/${lang.id}/default`);
      toast.success(`Đã đặt ${lang.code} làm mặc định`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cập nhật thất bại");
    }
  }

  async function handleDelete() {
    if (deleteId == null) return;
    try {
      await api.delete(`/admin/languages/${deleteId}`);
      toast.success("Đã xóa ngôn ngữ");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xóa thất bại");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="">
      <PageHeader
        title="Ngôn ngữ & Bản dịch"
        description="Quản lý ngôn ngữ hiển thị và import/export bảng dịch nội dung."
        actions={
          <Button onClick={() => setForm(EMPTY_FORM)}>
            <Plus className="mr-1 size-4" /> Thêm ngôn ngữ
          </Button>
        }
      />

      {form && (
        <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-bold">Ngôn ngữ mới</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Mã (vd: vi)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Tên (vd: 日本語)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Tên bản địa"
              value={form.nativeName}
              onChange={(e) => setForm({ ...form, nativeName: e.target.value })}
            />
            <input
              type="number"
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Thứ tự"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button variant="outline" onClick={() => setForm(null)}>
              Hủy
            </Button>
          </div>
        </section>
      )}

      <section className="mb-8 overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Bản địa</th>
              <th className="px-4 py-3">Thứ tự</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            )}
            {(langs ?? []).map((lang) => (
              <tr key={lang.id}>
                <td className="px-4 py-3 font-mono font-bold uppercase">{lang.code}</td>
                <td className="px-4 py-3">{lang.name}</td>
                <td className="px-4 py-3 text-slate-500">{lang.native_name ?? "—"}</td>
                <td className="px-4 py-3">{lang.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {lang.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                        <Star className="size-3" /> Mặc định
                      </span>
                    )}
                    <button
                      onClick={() => toggleActive(lang)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                        lang.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {lang.is_active ? <Check className="size-3" /> : <X className="size-3" />}
                      {lang.is_active ? "Bật" : "Tắt"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {!lang.is_default && (
                      <Button variant="ghost" size="sm" onClick={() => makeDefault(lang)} title="Đặt mặc định">
                        <Star className="size-4" />
                      </Button>
                    )}
                    {!lang.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(lang.id)}
                        title="Xóa"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <TranslationTools languages={langs ?? []} />

      <TranslationEditorSection languages={langs ?? []} />

      <ConfirmDialog
        open={deleteId != null}
        title="Xóa ngôn ngữ?"
        description="Bản dịch của ngôn ngữ này sẽ không còn được sử dụng."
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onOpenChange={(o) => !o && setDeleteId(null)}
      />
    </div>
  );
}

function TranslationTools({ languages }: { languages: Language[] }) {
  const nonDefault = languages.filter((l) => !l.is_default);
  const [locale, setLocale] = useState("");
  const [busy, setBusy] = useState(false);

  async function download(format: "xlsx" | "json") {
    if (!locale) {
      toast.error("Chọn ngôn ngữ cần xuất");
      return;
    }
    setBusy(true);
    try {
      // 1 file gồm toàn bộ module cho ngôn ngữ này (Excel: mỗi module 1 sheet).
      const qs = new URLSearchParams({ locale, format });
      const res = await fetch(`${BASE_URL}/api/admin/translations/export?${qs}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Xuất file thất bại");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `translations_${locale}.${format}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xuất file thất bại");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE_URL}/api/admin/translations/import`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message ?? "Import thất bại");
      const { inserted, updated, errors } = json.data;
      toast.success(`Đã thêm ${inserted}, cập nhật ${updated}. Lỗi: ${errors.length}`);
      if (errors.length) {
        console.warn("[translations import] errors:", errors);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import thất bại");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-1 font-bold">Import / Export bản dịch</h2>
      <p className="mb-4 text-sm text-slate-500">
        Xuất 1 file gồm toàn bộ nội dung (Excel: mỗi module 1 sheet, kèm giá trị gốc) để dịch rồi
        import lại 1 lần. Hỗ trợ Excel (.xlsx) và JSON.
      </p>

      <label className="block max-w-xs text-sm">
        <span className="mb-1 block font-medium">Ngôn ngữ đích</span>
        <select
          className="w-full rounded-lg border px-3 py-2"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="">— Chọn —</option>
          {nonDefault.map((l) => (
            <option key={l.id} value={l.code}>
              {l.name} ({l.code})
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy} onClick={() => download("xlsx")}>
          <Download className="mr-1 size-4" /> Export Excel
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => download("json")}>
          <Download className="mr-1 size-4" /> Export JSON
        </Button>
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--konnit-berry)] px-3 py-2 text-sm font-medium text-[var(--konnit-berry)] hover:bg-[var(--konnit-pink-02)]">
          <Upload className="size-4" /> Import file
          <input
            type="file"
            accept=".xlsx,.json,application/json"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </section>
  );
}

function TranslationEditorSection({ languages }: { languages: Language[] }) {
  const nonDefault = languages.filter((l) => !l.is_default);
  const { data: modules } = useFetch<ModuleInfo[]>("/admin/translations/modules");

  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLocale, setSelectedLocale] = useState("");
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function loadTranslations(mod: string, loc: string) {
    setLoading(true);
    setEdits({});
    setRows([]);
    try {
      const qs = new URLSearchParams({ module: mod, locale: loc, format: "json" });
      const res = await fetch(`${BASE_URL}/api/admin/translations/export?${qs}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Tải thất bại");
      const data: ExportRow[] = await res.json();
      setRows(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tải thất bại");
    } finally {
      setLoading(false);
    }
  }

  function handleModuleChange(v: string) {
    setSelectedModule(v);
    setEdits({});
    setRows([]);
    if (v && selectedLocale) loadTranslations(v, selectedLocale);
  }

  function handleLocaleChange(v: string) {
    setSelectedLocale(v);
    setEdits({});
    setRows([]);
    if (selectedModule && v) loadTranslations(selectedModule, v);
  }

  const editKey = (row: ExportRow) => `${row.entity_id}:${row.field}`;

  function getCurrent(row: ExportRow): string {
    const k = editKey(row);
    return k in edits ? edits[k] : (row.value ?? "");
  }

  function setEdit(row: ExportRow, val: string) {
    setEdits((prev) => ({ ...prev, [editKey(row)]: val }));
  }

  const pendingCount = Object.keys(edits).length;

  async function save() {
    if (pendingCount === 0) return;
    setSaving(true);
    try {
      const entries = Object.entries(edits).map(([key, value]) => {
        const colonIdx = key.indexOf(":");
        const entityId = Number(key.slice(0, colonIdx));
        const field = key.slice(colonIdx + 1);
        return { module: selectedModule, entityId, field, locale: selectedLocale, value };
      });
      await api.put("/admin/translations", { entries });
      toast.success(`Đã lưu ${pendingCount} bản dịch`);
      setRows((prev) =>
        prev.map((r) => {
          const k = editKey(r);
          return k in edits ? { ...r, value: edits[k] } : r;
        }),
      );
      setEdits({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  const lowerSearch = search.toLowerCase();
  const filtered = search
    ? rows.filter(
        (r) =>
          r.source_value.toLowerCase().includes(lowerSearch) ||
          (r.value ?? "").toLowerCase().includes(lowerSearch) ||
          r.field.toLowerCase().includes(lowerSearch),
      )
    : rows;

  const grouped = filtered.reduce<Map<number, ExportRow[]>>((map, row) => {
    const arr = map.get(row.entity_id) ?? [];
    arr.push(row);
    map.set(row.entity_id, arr);
    return map;
  }, new Map());

  function entityLabel(entityRows: ExportRow[]): string {
    const primary = entityRows.find((r) => r.field === "name" || r.field === "title");
    return primary?.source_value || `#${entityRows[0].entity_id}`;
  }

  const isLongField = (row: ExportRow) =>
    row.field.includes("description") ||
    row.field === "content_json" ||
    row.field === "location" ||
    row.source_value.length > 120;

  return (
    <section className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
        <h2 className="font-bold">Dịch nội dung trực tiếp</h2>

        <select
          className="rounded-lg border px-3 py-1.5 text-sm"
          value={selectedModule}
          onChange={(e) => handleModuleChange(e.target.value)}
        >
          <option value="">— Module —</option>
          {(modules ?? []).map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border px-3 py-1.5 text-sm"
          value={selectedLocale}
          onChange={(e) => handleLocaleChange(e.target.value)}
        >
          <option value="">— Ngôn ngữ —</option>
          {nonDefault.map((l) => (
            <option key={l.id} value={l.code}>
              {l.name} ({l.code})
            </option>
          ))}
        </select>

        {rows.length > 0 && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              className="rounded-lg border py-1.5 pl-8 pr-3 text-sm"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {pendingCount > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              className="text-xs text-slate-400 hover:text-slate-600"
              onClick={() => setEdits({})}
            >
              Hoàn tác
            </button>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-1 size-4" />
              {saving ? "Đang lưu..." : `Lưu ${pendingCount} thay đổi`}
            </Button>
          </div>
        )}
      </div>

      {loading && (
        <div className="py-10 text-center text-slate-400 text-sm">Đang tải...</div>
      )}

      {!loading && !selectedModule && (
        <div className="py-10 text-center text-slate-400 text-sm">
          Chọn module và ngôn ngữ để bắt đầu chỉnh sửa bản dịch
        </div>
      )}

      {!loading && selectedModule && selectedLocale && rows.length === 0 && (
        <div className="py-10 text-center text-slate-400 text-sm">
          Không có nội dung nào cần dịch
        </div>
      )}

      {!loading && grouped.size > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 w-32">Field</th>
                <th className="px-4 py-2 w-2/5">Nội dung gốc</th>
                <th className="px-4 py-2">
                  Bản dịch{" "}
                  <span className="font-mono normal-case text-slate-400">({selectedLocale})</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from(grouped.entries()).flatMap(([entityId, entityRows]) => [
                <tr key={`g-${entityId}`} className="bg-slate-50/80">
                  <td
                    colSpan={3}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-500"
                  >
                    <span className="mr-2 font-mono text-slate-400">#{entityId}</span>
                    {entityLabel(entityRows)}
                  </td>
                </tr>,
                ...entityRows.map((row) => {
                  const current = getCurrent(row);
                  const isDirty = editKey(row) in edits;
                  const long = isLongField(row);
                  return (
                    <tr
                      key={`${entityId}:${row.field}`}
                      className={isDirty ? "bg-amber-50" : "hover:bg-slate-50/50"}
                    >
                      <td className="px-4 py-2 align-top font-mono text-xs text-slate-500">
                        {row.field}
                        {isDirty && (
                          <span className="ml-1 inline-block size-1.5 rounded-full bg-amber-400 align-middle" />
                        )}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-500">
                        <p className="line-clamp-4 whitespace-pre-wrap break-words text-xs">
                          {row.source_value}
                        </p>
                      </td>
                      <td className="px-4 py-2 align-top">
                        {long ? (
                          <textarea
                            rows={3}
                            className="w-full resize-y rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            value={current}
                            onChange={(e) => setEdit(row, e.target.value)}
                            placeholder="Nhập bản dịch..."
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            value={current}
                            onChange={(e) => setEdit(row, e.target.value)}
                            placeholder="Nhập bản dịch..."
                          />
                        )}
                      </td>
                    </tr>
                  );
                }),
              ])}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
