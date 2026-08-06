import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { UserForm } from '../components/forms/UserForm';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { EmptyState } from '../components/shared/States';
import { PageBanner } from '../components/shared/PageBanner';
import { RowActionsMenu, type RowActionItem } from '../components/shared/RowActionsMenu';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SuccessModal } from '../components/shared/SuccessModal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  listBranches,
  listDepartments,
  listRoles,
  updateAdminUser
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import type { AdminUserPayload, AdminUserRecord, Branch, Department, RoleConfig } from '../types';

function joinLabels(codes: string[], roles: RoleConfig[]): string {
  return codes
    .map((code) => roles.find((role) => role.code === code)?.name ?? code)
    .join(', ');
}

export function Users() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<AdminUserRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<AdminUserRecord | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadSupportData = useCallback(async () => {
    if (!accessToken) return;
    const [departmentsResponse, branchesResponse, rolesResponse] = await Promise.all([
      listDepartments(accessToken),
      listBranches(accessToken),
      listRoles(accessToken)
    ]);

    if (departmentsResponse.error ?? branchesResponse.error ?? rolesResponse.error) {
      setError(departmentsResponse.error ?? branchesResponse.error ?? rolesResponse.error);
      return;
    }

    setDepartments(departmentsResponse.data ?? []);
    setBranches(branchesResponse.data ?? []);
    setRoles(rolesResponse.data ?? []);
  }, [accessToken]);

  const loadUsers = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listAdminUsers(accessToken);
    setRows(response.data ?? []);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken]);

  useEffect(() => {
    void Promise.all([loadUsers(), loadSupportData()]);
  }, [loadUsers, loadSupportData]);

  async function handleCreate(payload: AdminUserPayload) {
    if (!accessToken) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createAdminUser(accessToken, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to create user.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`User ${response.data.username} created successfully.`);
    await loadUsers();
  }

  async function handleUpdate(payload: AdminUserPayload) {
    if (!accessToken || !selected) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateAdminUser(accessToken, selected.id, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to update user.');
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`User ${response.data.username} updated successfully.`);
    await loadUsers();
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget) return;
    setDeleteBusy(true);
    const response = await deleteAdminUser(accessToken, deleteTarget.id);
    setDeleteBusy(false);
    if (response.error) {
      setError(response.error);
      return;
    }

    if (selected?.id === deleteTarget.id) {
      setSelected(null);
      setDetailOpen(false);
    }
    setDeleteTarget(null);
    setSavedMessage(`User ${deleteTarget.username} deleted successfully.`);
    await loadUsers();
  }

  const departmentById = useMemo(
    () => Object.fromEntries(departments.map((department) => [department.id, department])),
    [departments]
  );
  const branchById = useMemo(
    () => Object.fromEntries(branches.map((branch) => [branch.id, branch])),
    [branches]
  );

  const columns = useMemo(() => {
    const base: Column<AdminUserRecord>[] = [
      {
        key: 'username',
        header: 'Username',
        value: (row) => row.username,
        render: (row) => <span className="font-medium text-navy">{row.username}</span>
      },
      {
        key: 'fullName',
        header: 'Full name',
        value: (row) => row.fullName
      },
      {
        key: 'department',
        header: 'Department',
        value: (row) => departmentById[row.departmentId]?.name ?? row.departmentId,
        render: (row) => (
          <span className="block max-w-[220px] truncate">
            {departmentById[row.departmentId]?.name ?? row.departmentId}
          </span>
        )
      },
      {
        key: 'branch',
        header: 'Branch',
        value: (row) => branchById[row.branchId]?.name ?? row.branchId,
        render: (row) => <span className="block max-w-[220px] truncate">{branchById[row.branchId]?.name ?? row.branchId}</span>
      },
      {
        key: 'active',
        header: 'Status',
        filterable: true,
        value: (row) => (row.active ? 'Active' : 'Inactive'),
        render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} />
      },
      {
        key: 'locked',
        header: 'Lock state',
        filterable: true,
        value: (row) => (row.locked ? 'Locked' : 'Unlocked'),
        render: (row) => <StatusBadge status={row.locked ? 'Locked' : 'Unlocked'} />
      },
      {
        key: 'roles',
        header: 'Roles',
        value: (row) => joinLabels(row.roles, roles),
        render: (row) => <span className="block max-w-[240px] truncate">{joinLabels(row.roles, roles)}</span>
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        value: () => 'Actions',
        render: (row) => {
          const actions: RowActionItem[] = [
            {
              key: 'view',
              label: 'View user',
              icon: EyeIcon,
              onClick: () => {
                setSelected(row);
                setDetailOpen(true);
                setOpenMenuId(null);
              }
            },
            {
              key: 'edit',
              label: 'Update user',
              icon: PencilIcon,
              onClick: () => {
                setSelected(row);
                setFormMode('edit');
                setFormError(null);
                setFormOpen(true);
                setOpenMenuId(null);
              }
            },
            {
              key: 'delete',
              label: 'Delete or suspend user',
              icon: Trash2Icon,
              tone: 'danger',
              onClick: () => {
                setDeleteTarget(row);
                setOpenMenuId(null);
              }
            }
          ];

          return (
            <RowActionsMenu
              open={openMenuId === row.id}
              onToggle={() => setOpenMenuId((current) => (current === row.id ? null : row.id))}
              actions={actions}
              ariaLabel={`Actions for ${row.username}`}
            />
          );
        }
      }
    ];

    return base;
  }, [openMenuId, departmentById, branchById, roles]);

  const activeCount = rows.filter((row) => row.active).length;
  const lockedCount = rows.filter((row) => row.locked).length;

  return (
    <>
      <PageBanner
        title="Users"
        subtitle="Admin-only user management with live department, branch, and role assignments"
        breadcrumb={['Kyronix', 'Users']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void Promise.all([loadUsers(), loadSupportData()])}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setSelected(null);
                setFormMode('create');
                setFormError(null);
                setFormOpen(true);
              }}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Create user
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total users" value={String(rows.length)} tone="neutral" delta={0} />
        <StatCard label="Active" value={String(activeCount)} tone="success" delta={0} />
        <StatCard label="Locked" value={String(lockedCount)} tone="critical" delta={0} />
      </div>

      {!accessToken && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No access token is available. Sign in again to manage users.
        </div>
      )}

      {accessToken && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void Promise.all([loadUsers(), loadSupportData()])}
          onRowClick={(row) => {
            setSelected(row);
            setDetailOpen(true);
          }}
          searchPlaceholder="Search username, full name, department, branch, role"
          exportName="users"
          pageSize={10}
        />
      )}

      <UserForm
        open={formOpen}
        mode={formMode}
        initialValues={selected}
        departments={departments}
        branches={branches}
        roles={roles}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <DetailDrawer
        open={detailOpen}
        title={selected?.username ?? 'User detail'}
        subtitle="Admin user record"
        onClose={() => setDetailOpen(false)}
        width="lg"
      >
        {!selected && <EmptyState description="Select a user to view its details." />}
        {selected && (
          <dl>
            <DetailRow label="ID">{selected.id}</DetailRow>
            <DetailRow label="Username">{selected.username}</DetailRow>
            <DetailRow label="Full name">{selected.fullName}</DetailRow>
            <DetailRow label="Department">{departmentById[selected.departmentId]?.name ?? selected.departmentId}</DetailRow>
            <DetailRow label="Branch">{branchById[selected.branchId]?.name ?? selected.branchId}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={selected.active ? 'Active' : 'Inactive'} />
            </DetailRow>
            <DetailRow label="Lock state">
              <StatusBadge status={selected.locked ? 'Locked' : 'Unlocked'} />
            </DetailRow>
            <DetailRow label="Roles">{joinLabels(selected.roles, roles)}</DetailRow>
            <DetailRow label="Permissions">{selected.permissions.join(', ') || 'None'}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <SuccessModal
        open={Boolean(savedMessage)}
        title="User action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.username}?` : 'Delete user?'}
        description={
          deleteTarget
            ? `This will delete or suspend the ${deleteTarget.fullName} user account. This action cannot be undone from the UI.`
            : undefined
        }
        confirmLabel="Delete user"
        cancelLabel="Cancel"
        busy={deleteBusy}
        tone="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => {
          if (deleteBusy) return;
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
