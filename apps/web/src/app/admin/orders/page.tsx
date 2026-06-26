"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Eye,
  ReceiptText,
  Search,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/shop/format";
import { useFetch } from "@/hooks/useCmsData";
import type { AdminOrder } from "@/lib/admin-ticketing/types";

type StatusFilter = "all" | "pending" | "paid" | "failed" | "expired";
type OrderStatus = AdminOrder["status"];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Tất cả",
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  expired: "Hết hạn",
};

const STATUS_OPTIONS: StatusFilter[] = ["all", "pending", "paid", "failed", "expired"];

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "failed", "expired"],
  paid: ["failed"],
  failed: ["pending", "paid"],
  expired: ["pending"],
};

export default function AdminOrdersPage() {
  const { data: fetchedOrders, loading, error, refetch } =
    useFetch<AdminOrder[]>("/admin/orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);

  useEffect(() => {
    setOrders(fetchedOrders ?? []);
  }, [fetchedOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refetch();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refetch]);

  const filteredOrders = useMemo(() => {
    let list = orders;

    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.order_code.toLowerCase().includes(q) ||
          o.contact_name.toLowerCase().includes(q) ||
          o.contact_phone.includes(q) ||
          o.contact_email.toLowerCase().includes(q),
      );
    }

    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders, statusFilter, searchQuery]);

  const handleExport = () => {
    toast.success("Chức năng xuất Excel sẽ được kết nối sau");
  };

  function openDetail(order: AdminOrder) {
    setSelectedOrder(order);
    setNewStatus("");
  }

  async function handleUpdateStatus() {
    if (!selectedOrder || !newStatus) return;

    setUpdatingCode(selectedOrder.order_code);
    await refetch();

    toast.success(
      `Đã cập nhật đơn ${selectedOrder.order_code} → ${STATUS_LABELS[newStatus as OrderStatus]}`,
    );
    setUpdatingCode(null);
    setNewStatus("");
  }

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        description="Quản lý và tra cứu lịch sử đặt vé"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <ReceiptText className="mr-2 size-4" />
            Xuất Excel
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === opt
                  ? "bg-[var(--konnit-berry)] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {STATUS_LABELS[opt]}
              {opt !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({orders.filter((o) => o.status === opt).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã, tên, SĐT, email..."
            className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-8 text-sm outline-none transition focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted-foreground">Đang tải đơn hàng...</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title={
            statusFilter !== "all" || searchQuery
              ? "Không tìm thấy đơn hàng"
              : "Chưa có đơn hàng"
          }
          description={
            statusFilter !== "all" || searchQuery
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Khi có khách đặt vé, đơn hàng sẽ xuất hiện ở đây"
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Số vé</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const totalQty = order.items.length;
              return (
                <TableRow key={order.order_code}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {order.order_code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.contact_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.contact_phone}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.contact_email}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {totalQty} vé
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatVND(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {order.payment_method === "card"
                        ? "Thẻ"
                        : order.payment_method === "qr"
                          ? "QR"
                          : "Chuyển khoản"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetail(order)}
                    >
                      <Eye className="mr-1 size-3.5" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
            setNewStatus("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono">{selectedOrder?.order_code}</span>
              {selectedOrder && <OrderStatusBadge status={selectedOrder.status} />}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              {/* Customer info */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                  THÔNG TIN KHÁCH HÀNG
                </h4>
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Họ tên:</span>
                    <p className="font-medium">{selectedOrder.contact_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span>
                    <p className="font-medium">{selectedOrder.contact_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedOrder.contact_email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phương thức:</span>
                    <p className="font-medium capitalize">
                      {selectedOrder.payment_method === "card"
                        ? "Thẻ ngân hàng"
                        : selectedOrder.payment_method === "qr"
                          ? "Ví QR"
                          : "Chuyển khoản QR"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày đặt:</span>
                    <p className="font-medium">
                      {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                  DANH SÁCH VÉ ({selectedOrder.items.length} vé)
                </h4>
                <div className="divide-y rounded-xl border">
                  <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
                    <span className="flex-1">Bé</span>
                    <span className="w-28 text-right">Loại vé</span>
                    <span className="w-24 text-right">Đơn giá</span>
                  </div>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                    >
                      <span className="flex-1 font-medium">
                        {item.attendee_name}
                        {item.qr_token && (
                          <span className="mt-1 block break-all font-mono text-xs text-green-700">
                            {item.qr_token}
                          </span>
                        )}
                      </span>
                      <span className="w-28 text-right text-muted-foreground">
                        {item.ticket_name}
                      </span>
                      <span className="w-24 text-right font-medium">
                        {formatVND(item.unit_price)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3 font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-lg text-[var(--konnit-berry)]">
                      {formatVND(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Status Section */}
              <div className="rounded-xl border border-dashed p-4">
                <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
                  CẬP NHẬT TRẠNG THÁI
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    disabled
                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20"
                  >
                    <option value="">-- Chọn trạng thái mới --</option>
                    {VALID_TRANSITIONS[selectedOrder.status].map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={handleUpdateStatus}
                    disabled
                  >
                    {updatingCode === selectedOrder.order_code ? (
                      <>Đang cập nhật...</>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-1.5 size-4" />
                        Cập nhật
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Trạng thái hiện tại:{" "}
                  <strong>{STATUS_LABELS[selectedOrder.status]}</strong>.
                  Có thể chuyển sang:{" "}
                  {VALID_TRANSITIONS[selectedOrder.status]
                    .map((s) => STATUS_LABELS[s])
                    .join(", ")}.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {selectedOrder.status === "paid" && (
                  <Button variant="outline" size="sm">
                    Gửi lại email vé
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(null);
                    setNewStatus("");
                  }}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<
    OrderStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    pending: { label: "Chờ thanh toán", variant: "outline" },
    paid: { label: "Đã thanh toán", variant: "default" },
    failed: { label: "Thất bại", variant: "destructive" },
    expired: { label: "Hết hạn", variant: "secondary" },
  };

  const config = map[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
