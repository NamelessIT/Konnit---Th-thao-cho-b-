"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Lock, Unlock, ShieldCheck, Users } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useFetch } from "@/hooks/useCmsData";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api-client";
import {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_LABELS_VI,
  ROLE_RANK,
  type AccountStatus,
} from "@konnit/types";

// Rank hiệu lực = rank cao nhất trong các role. Role tuỳ biến → 10.
const rankOf = (keys?: string[]) =>
  (keys ?? []).reduce((max, k) => Math.max(max, ROLE_RANK[k] ?? 10), 0);

type AccessRoleRef = { key: string; name: string };
type AccessUser = {
  id: number;
  email: string;
  full_name: string | null;
  status: AccountStatus;
  created_at: string;
  roles: AccessRoleRef[];
};
type Role = {
  id: number;
  key: string;
  name: string;
  realm: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
};
type Permission = {
  id: number;
  key: string;
  resource: string;
  action: string;
  description: string | null;
};

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20";

function errMsg(e: unknown) {
  return e instanceof ApiError ? e.message : "Đã có lỗi xảy ra";
}

export default function AccessPage() {
  const [tab, setTab] = useState<"users" | "roles">("users");

  const usersQ = useFetch<AccessUser[]>("/admin/access/users");
  const rolesQ = useFetch<Role[]>("/admin/access/roles");
  const permsQ = useFetch<Permission[]>("/admin/access/permissions");

  const { user } = useAuth();
  const myRank = rankOf(user?.roles);

  // Chỉ được gán role có rank THẤP HƠN mình (khớp guard BE).
  const grantableRoles = useMemo(
    () =>
      (rolesQ.data ?? []).filter(
        (r) => r.realm === "admin" && (ROLE_RANK[r.key] ?? 10) < myRank,
      ),
    [rolesQ.data, myRank],
  );

  return (
    <div>
      <PageHeader
        title="Tài khoản & Phân quyền"
        description="Quản lý tài khoản nội bộ, vai trò và quyền hạn (RBAC)"
      />

      <div className="mb-6 flex gap-1.5">
        {(
          [
            { id: "users", label: "Tài khoản", icon: Users },
            { id: "roles", label: "Vai trò & Quyền", icon: ShieldCheck },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-[var(--konnit-berry)] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "users" ? (
        <UsersTab
          users={usersQ.data ?? []}
          loading={usersQ.loading}
          roles={grantableRoles}
          myRank={myRank}
          refetch={usersQ.refetch}
        />
      ) : (
        <RolesTab
          roles={rolesQ.data ?? []}
          loading={rolesQ.loading}
          permissions={permsQ.data ?? []}
          refetch={rolesQ.refetch}
        />
      )}
    </div>
  );
}

/* ============================ USERS ============================ */

function UsersTab({
  users,
  loading,
  roles,
  myRank,
  refetch,
}: {
  users: AccessUser[];
  loading: boolean;
  roles: Role[];
  myRank: number;
  refetch: () => void;
}) {
  const [editing, setEditing] = useState<AccessUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function toggleStatus(u: AccessUser) {
    setBusyId(u.id);
    try {
      await api.post(`/admin/access/users/${u.id}/${u.status === "active" ? "ban" : "unlock"}`);
      toast.success(u.status === "active" ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản");
      refetch();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(u: AccessUser) {
    if (!window.confirm(`Xoá tài khoản ${u.email}?`)) return;
    setBusyId(u.id);
    try {
      await api.delete(`/admin/access/users/${u.id}`);
      toast.success("Đã xoá tài khoản");
      refetch();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 size-4" />
          Thêm tài khoản
        </Button>
      </div>

      {loading && users.length === 0 ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : users.length === 0 ? (
        <EmptyState title="Chưa có tài khoản" description="Tạo tài khoản nội bộ đầu tiên" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const rowRank = rankOf(u.roles.map((r) => r.key));
              const canManage = rowRank < myRank;
              return (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">{u.full_name || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      u.roles.map((r) => (
                        <Badge key={r.key} variant="outline">
                          {r.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === ACCOUNT_STATUS.ACTIVE ? "default" : "secondary"}>
                    {ACCOUNT_STATUS_LABELS_VI[u.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {canManage ? (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(u)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === u.id}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status === ACCOUNT_STATUS.ACTIVE ? (
                          <Lock className="size-3.5" />
                        ) : (
                          <Unlock className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === u.id}
                        onClick={() => remove(u)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">— ngang/cao cấp —</span>
                  )}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {creating && (
        <UserDialog
          roles={roles}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refetch();
          }}
        />
      )}
      {editing && (
        <UserDialog
          roles={roles}
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function UserDialog({
  roles,
  user,
  onClose,
  onSaved,
}: {
  roles: Role[];
  user?: AccessUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [roleKeys, setRoleKeys] = useState<string[]>(user?.roles.map((r) => r.key) ?? []);
  const [saving, setSaving] = useState(false);

  function toggleRole(key: string) {
    setRoleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  async function save() {
    if (!isEdit && (!email.trim() || password.length < 8)) {
      toast.error("Email hợp lệ và mật khẩu ≥ 8 ký tự");
      return;
    }
    if (roleKeys.length === 0) {
      toast.error("Chọn ít nhất 1 vai trò");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/access/users/${user!.id}`, {
          fullName: fullName || undefined,
          roleKeys,
        });
        toast.success("Đã cập nhật tài khoản");
      } else {
        await api.post("/admin/access/users", {
          email: email.trim(),
          password,
          fullName: fullName || undefined,
          roleKeys,
        });
        toast.success("Đã tạo tài khoản");
      }
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa tài khoản" : "Thêm tài khoản"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              className={inputCls}
              value={email}
              disabled={isEdit}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhanvien@konnit.local"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
              <input
                className={inputCls}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Họ tên</label>
            <input
              className={inputCls}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tên hiển thị (tuỳ chọn)"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Vai trò</label>
            <div className="space-y-1.5 rounded-xl border p-3">
              {roles.map((r) => (
                <label key={r.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={roleKeys.includes(r.key)}
                    onChange={() => toggleRole(r.key)}
                  />
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">({r.key})</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ ROLES ============================ */

function RolesTab({
  roles,
  loading,
  permissions,
  refetch,
}: {
  roles: Role[];
  loading: boolean;
  permissions: Permission[];
  refetch: () => void;
}) {
  const [editing, setEditing] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function remove(r: Role) {
    if (!window.confirm(`Xoá vai trò "${r.name}"?`)) return;
    setBusyId(r.id);
    try {
      await api.delete(`/admin/access/roles/${r.id}`);
      toast.success("Đã xoá vai trò");
      refetch();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 size-4" />
          Thêm vai trò
        </Button>
      </div>

      {loading && roles.length === 0 ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((r) => (
            <div key={r.id} className="rounded-2xl border p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.name}</span>
                    {r.is_system && (
                      <Badge variant="secondary" className="text-[10px]">
                        Hệ thống
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {r.realm}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.key}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={r.is_system}
                    onClick={() => setEditing(r)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={r.is_system || busyId === r.id}
                    onClick={() => remove(r)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              {r.description && (
                <p className="mb-2 text-sm text-muted-foreground">{r.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {r.permissions.length} quyền
              </p>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <RoleDialog
          permissions={permissions}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            refetch();
          }}
        />
      )}
      {editing && (
        <RoleDialog
          permissions={permissions}
          role={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function RoleDialog({
  permissions,
  role,
  onClose,
  onSaved,
}: {
  permissions: Permission[];
  role?: Role;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!role;
  const [key, setKey] = useState(role?.key ?? "");
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permKeys, setPermKeys] = useState<string[]>(role?.permissions ?? []);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => {
    const m: Record<string, Permission[]> = {};
    for (const p of permissions) (m[p.resource] ??= []).push(p);
    return m;
  }, [permissions]);

  function togglePerm(k: string) {
    setPermKeys((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  async function save() {
    if (!name.trim() || (!isEdit && !key.trim())) {
      toast.error("Nhập mã và tên vai trò");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/access/roles/${role!.id}`, {
          name: name.trim(),
          description: description || undefined,
        });
        await api.put(`/admin/access/roles/${role!.id}/permissions`, {
          permissionKeys: permKeys,
        });
        toast.success("Đã cập nhật vai trò");
      } else {
        await api.post("/admin/access/roles", {
          key: key.trim(),
          name: name.trim(),
          description: description || undefined,
          permissionKeys: permKeys,
        });
        toast.success("Đã tạo vai trò");
      }
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa vai trò" : "Thêm vai trò"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Mã (key)</label>
              <input
                className={inputCls}
                value={key}
                disabled={isEdit}
                onChange={(e) => setKey(e.target.value)}
                placeholder="vd: sales_manager"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tên</label>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Quản lý bán vé"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mô tả</label>
            <input
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuỳ chọn"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Quyền hạn</label>
            <div className="space-y-4 rounded-xl border p-3">
              {Object.entries(grouped).map(([resource, perms]) => (
                <div key={resource}>
                  <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                    {resource}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {perms.map((p) => (
                      <label key={p.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={permKeys.includes(p.key)}
                          onChange={() => togglePerm(p.key)}
                        />
                        <span title={p.description ?? p.key}>{p.action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
