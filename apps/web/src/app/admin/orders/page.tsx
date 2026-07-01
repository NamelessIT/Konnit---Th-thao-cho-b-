"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, ReceiptText, Search, X } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatVND } from "@/lib/shop/format";
import { useFetch } from "@/hooks/useCmsData";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api-client";
import { ORDER_STATUS_LABELS_VI, ORDER_STATUSES, type OrderStatus } from "@konnit/types";
import type { AdminOrder } from "@/lib/admin-ticketing/types";

type StatusFilter = "all" | OrderStatus;
type RefundAction = "start" | "approve" | "reject" | "complete";

const STATUS_FILTERS: StatusFilter[] = ["all", ...ORDER_STATUSES];

const BADGE_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  paid: "default",
  refund_requested: "secondary",
  refunding: "secondary",
  refunded: "outline",
  expired: "secondary",
  failed: "destructive",
};

const REFUND_COPY: Record<
  RefundAction,
  { title: string; description: string; confirmLabel: string; variant: "default" | "destructive"; reason: "none" | "optional" | "required" }
> = {
  start: {
    title: "Bắt đầu hoàn tiền",
    description:
      "Xác nhận sẽ VÔ HIỆU mã QR, hoàn lại quota vé và trả lượt voucher (nếu có). Tiền được xử lý offline giữa bạn và khách.",
    confirmLabel: "Bắt đầu hoàn tiền",
    variant: "destructive",
    reason: "optional",
  },
  approve: {
    title: "Duyệt yêu cầu hoàn tiền",
    description:
      "Duyệt yêu cầu của khách: hệ thống sẽ vô hiệu QR, hoàn quota và trả lượt voucher. Tiền xử lý offline.",
    confirmLabel: "Duyệt & hoàn vé",
    variant: "destructive",
    reason: "none",
  },
  reject: {
    title: "Từ chối yêu cầu hoàn tiền",
    description:
      "Đơn sẽ quay lại trạng thái Đã thanh toán, mã QR dùng lại được. Vui lòng nhập lý do từ chối.",
    confirmLabel: "Từ chối",
    variant: "default",
    reason: "required",
  },
  complete: {
    title: "Đánh dấu đã hoàn tiền",
    description:
      "Xác nhận bạn đã thực sự chuyển tiền hoàn cho khách (ngoài hệ thống). Đơn sẽ chuyển sang Đã hoàn tiền.",
    confirmLabel: "Đã hoàn tiền",
    variant: "default",
    reason: "none",
  },
};

export default function AdminOrdersPage() {
  const { data: fetchedOrders, loading, error, refetch } =
    useFetch<AdminOrder[]>("/admin/orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const [refundAction, setRefundAction] = useState<RefundAction | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const { user } = useAuth();
  const canManageRefunds = user?.permissions?.includes("orders.manage_refunds") ?? false;
  const canConfirmPayment = user?.permissions?.includes("orders.confirm_payment") ?? false;
  const [confirmPayOpen, setConfirmPayOpen] = useState(false);

  useEffect(() => {
    setOrders(fetchedOrders ?? []);
  }, [fetchedOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => refetch(), 5000);
    return () => window.clearInterval(timer);
  }, [refetch]);

  const refundRequestedCount = useMemo(
    () => orders.filter((o) => o.status === "refund_requested").length,
    [orders],
  );

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
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
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders, statusFilter, searchQuery]);

  function openRefund(action: RefundAction) {
    setReason("");
    setRefundAction(action);
  }

  async function submitConfirmPayment() {
    if (!selectedOrder) return;
    setBusy(true);
    try {
      await api.post(`/admin/orders/${selectedOrder.order_code}/confirm-payment`, {});
      toast.success("Đã xác nhận thanh toán — vé QR đã được phát hành.");
      setConfirmPayOpen(false);
      setSelectedOrder(null);
      await refetch();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Thao tác thất bại");
    } finally {
      setBusy(false);
    }
  }

  async function submitRefund() {
    if (!selectedOrder || !refundAction) return;
    const copy = REFUND_COPY[refundAction];
    if (copy.reason === "required" && !reason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }
    setBusy(true);
    try {
      const body =
        refundAction === "reject"
          ? { reason: reason.trim() }
          : refundAction === "start"
            ? { reason: reason.trim() || undefined }
            : {};
      await api.post(`/admin/orders/${selectedOrder.order_code}/refund/${refundAction}`, body);
      toast.success("Đã cập nhật yêu cầu hoàn tiền");
      setRefundAction(null);
      setReason("");
      setSelectedOrder(null);
      await refetch();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Thao tác thất bại");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        description="Quản lý đơn đặt vé và xử lý hoàn tiền"
        actions={
          <Button variant="outline" onClick={() => toast.success("Chức năng xuất Excel sẽ được kết nối sau")}>
            <ReceiptText className="mr-2 size-4" />
            Xuất Excel
          </Button>
        }
      />

      {canManageRefunds && refundRequestedCount > 0 && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
          Có {refundRequestedCount} yêu cầu hoàn tiền đang chờ xử lý.
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((opt) => {
            const count = opt === "all" ? orders.length : orders.filter((o) => o.status === opt).length;
            const highlight = opt === "refund_requested" && count > 0;
            return (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === opt
                    ? "bg-[var(--konnit-berry)] text-white shadow-sm"
                    : highlight
                      ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt === "all" ? "Tất cả" : ORDER_STATUS_LABELS_VI[opt]}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
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
      {loading && orders.length === 0 ? (
        <p className="text-muted-foreground">Đang tải đơn hàng...</p>
      ) : error && orders.length === 0 ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title={statusFilter !== "all" || searchQuery ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng"}
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
            {filteredOrders.map((order) => (
              <TableRow key={order.order_code}>
                <TableCell>
                  <span className="font-mono text-sm font-medium">{order.order_code}</span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{order.contact_name}</div>
                  <div className="text-xs text-muted-foreground">{order.contact_phone}</div>
                  <div className="text-xs text-muted-foreground">{order.contact_email}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.items.length} vé</TableCell>
                <TableCell className="font-medium">{formatVND(order.total)}</TableCell>
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
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                    <Eye className="mr-1 size-3.5" />
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setSelectedOrder(null);
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
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">THÔNG TIN KHÁCH HÀNG</h4>
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
                    <span className="text-muted-foreground">Ngày đặt:</span>
                    <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString("vi-VN")}</p>
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
                    <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="flex-1 font-medium">
                        {item.attendee_name}
                        {item.qr_token && (
                          <span className="mt-1 block break-all font-mono text-xs text-green-700">
                            {item.qr_token}
                          </span>
                        )}
                      </span>
                      <span className="w-28 text-right text-muted-foreground">{item.ticket_name}</span>
                      <span className="w-24 text-right font-medium">{formatVND(item.unit_price)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3 font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-lg text-[var(--konnit-berry)]">{formatVND(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                {canConfirmPayment &&
                  selectedOrder.status === "pending" &&
                  selectedOrder.payment_method === "bank" && (
                    <Button size="sm" className="mr-auto" onClick={() => setConfirmPayOpen(true)}>
                      Xác nhận đã nhận chuyển khoản
                    </Button>
                  )}
                {canManageRefunds && selectedOrder.status === "paid" &&
                  (selectedOrder.items.some((i) => i.checked_in_at) ? (
                    <span className="mr-auto text-xs text-muted-foreground">
                      Đã có vé check-in — không thể hoàn tiền.
                    </span>
                  ) : (
                    <Button variant="destructive" size="sm" onClick={() => openRefund("start")}>
                      Bắt đầu hoàn tiền
                    </Button>
                  ))}
                {canManageRefunds && selectedOrder.status === "refund_requested" && (
                  <>
                    <Button size="sm" onClick={() => openRefund("approve")}>
                      Duyệt yêu cầu
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openRefund("reject")}>
                      Từ chối
                    </Button>
                  </>
                )}
                {canManageRefunds && selectedOrder.status === "refunding" && (
                  <Button size="sm" onClick={() => openRefund("complete")}>
                    Đánh dấu đã hoàn tiền
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund confirm dialog */}
      <Dialog
        open={refundAction !== null}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setRefundAction(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          {refundAction && (
            <>
              <DialogHeader>
                <DialogTitle>{REFUND_COPY[refundAction].title}</DialogTitle>
                <DialogDescription>{REFUND_COPY[refundAction].description}</DialogDescription>
              </DialogHeader>
              {REFUND_COPY[refundAction].reason !== "none" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Lý do {REFUND_COPY[refundAction].reason === "optional" ? "(tuỳ chọn)" : ""}
                  </label>
                  <Textarea
                    value={reason}
                    maxLength={500}
                    rows={3}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do…"
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setRefundAction(null);
                    setReason("");
                  }}
                >
                  Đóng
                </Button>
                <Button variant={REFUND_COPY[refundAction].variant} disabled={busy} onClick={submitRefund}>
                  {busy ? "Đang xử lý…" : REFUND_COPY[refundAction].confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm transfer payment dialog */}
      <Dialog
        open={confirmPayOpen}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirmPayOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đã nhận chuyển khoản</DialogTitle>
            <DialogDescription>
              Chỉ xác nhận khi đã đối soát và thấy tiền về tài khoản với đúng nội dung là mã đơn{" "}
              <span className="font-mono font-semibold">{selectedOrder?.order_code}</span>. Hệ thống sẽ
              chuyển đơn sang “Đã thanh toán”, trừ suất vé và phát hành vé QR cho từng bé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setConfirmPayOpen(false)}>
              Đóng
            </Button>
            <Button disabled={busy} onClick={submitConfirmPayment}>
              {busy ? "Đang xử lý…" : "Xác nhận & phát hành vé"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={BADGE_VARIANT[status]}>{ORDER_STATUS_LABELS_VI[status]}</Badge>;
}
