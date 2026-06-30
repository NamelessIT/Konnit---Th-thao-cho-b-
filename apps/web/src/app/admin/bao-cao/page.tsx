"use client";

import { useMemo, useState } from "react";
import { Wallet, Ticket, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetch } from "@/hooks/useCmsData";
import { formatVND } from "@/lib/shop/format";

type EventLite = { id: number; name: string };
type Overview = {
  revenue: number;
  ticketsTotal: number;
  ticketsCheckedIn: number;
  orders: { paid: number; pending: number; cancelled: number };
  byType: {
    id: number;
    name: string;
    quota_total: number;
    sold_count: number;
    tickets_generated: number;
    checked_in: number;
  }[];
};
type CheckinRow = {
  id: number;
  qr_token: string;
  checked_in_at: string | null;
  checked_in_by_name: string | null;
  attendee_name: string;
  ticket_type_name: string;
  order_code: string;
  contact_name: string;
};

export default function ReportsPage() {
  const [eventId, setEventId] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");

  const eventsQ = useFetch<EventLite[]>("/admin/events");
  const q = eventId === "all" ? "" : `?eventId=${eventId}`;
  const overviewQ = useFetch<Overview>(`/admin/reports/overview${q}`);
  const listQ = useFetch<CheckinRow[]>(`/admin/reports/checkin${q}`);

  const o = overviewQ.data;
  const checkInRate =
    o && o.ticketsTotal > 0
      ? Math.round((o.ticketsCheckedIn / o.ticketsTotal) * 100)
      : 0;

  const rows = useMemo(() => {
    const list = listQ.data ?? [];
    if (filter === "in") return list.filter((r) => r.checked_in_at);
    if (filter === "out") return list.filter((r) => !r.checked_in_at);
    return list;
  }, [listQ.data, filter]);

  return (
    <div>
      <PageHeader
        title="Báo cáo & Doanh số"
        description="Thống kê vé bán ra, doanh thu và tình trạng check-in"
        actions={
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20"
          >
            <option value="all">Tất cả sự kiện</option>
            {(eventsQ.data ?? []).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        }
      />

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Doanh số (đã thanh toán)"
          value={o ? formatVND(o.revenue) : "—"}
        />
        <StatCard
          icon={Ticket}
          label="Vé đã bán"
          value={o ? String(o.ticketsTotal) : "—"}
          sub={o ? `${o.orders.paid} đơn paid` : ""}
        />
        <StatCard
          icon={CheckCircle2}
          label="Đã check-in"
          value={o ? `${o.ticketsCheckedIn}/${o.ticketsTotal}` : "—"}
          sub={`${checkInRate}%`}
        />
        <StatCard
          icon={Clock}
          label="Đơn chờ thanh toán"
          value={o ? String(o.orders.pending) : "—"}
          sub={o ? `${o.orders.cancelled} huỷ/hết hạn` : ""}
        />
      </div>

      {/* Breakdown theo loại vé */}
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
        THEO LOẠI VÉ
      </h3>
      <div className="mb-8 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loại vé</TableHead>
              <TableHead className="text-right">Quota</TableHead>
              <TableHead className="text-right">Đã bán</TableHead>
              <TableHead className="text-right">Đã check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(o?.byType ?? []).map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {t.quota_total}
                </TableCell>
                <TableCell className="text-right">{t.tickets_generated}</TableCell>
                <TableCell className="text-right">
                  {t.checked_in}/{t.tickets_generated}
                </TableCell>
              </TableRow>
            ))}
            {(o?.byType ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Danh sách check-in */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">
          DANH SÁCH VÉ ({rows.length})
        </h3>
        <div className="flex gap-1.5">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "in", label: "Đã check-in" },
              { id: "out", label: "Chưa" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-[var(--konnit-berry)] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bé</TableHead>
              <TableHead>Loại vé</TableHead>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Mã vé</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.attendee_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {r.ticket_type_name}
                </TableCell>
                <TableCell className="font-mono text-xs">{r.order_code}</TableCell>
                <TableCell className="font-mono text-xs">{r.qr_token}</TableCell>
                <TableCell>
                  {r.checked_in_at ? (
                    <div>
                      <Badge variant="default">Đã check-in</Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(r.checked_in_at).toLocaleString("vi-VN")}
                        {r.checked_in_by_name ? ` · ${r.checked_in_by_name}` : ""}
                      </div>
                    </div>
                  ) : (
                    <Badge variant="secondary">Chưa</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {listQ.loading ? "Đang tải..." : "Không có vé"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--konnit-ink)]">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}