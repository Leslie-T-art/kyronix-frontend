import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, TextArea, TextInput, ToggleField } from '../ui/Field';
import type {
  AdminUserPayload,
  AdminUserRecord,
  Branch,
  Department,
  RoleConfig
} from '../../types';

interface UserFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: AdminUserRecord | null;
  departments: Department[];
  branches: Branch[];
  roles: RoleConfig[];
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: AdminUserPayload) => Promise<void> | void;
}

export function UserForm({
  open,
  mode,
  initialValues,
  departments,
  branches,
  roles,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: UserFormProps) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [locked, setLocked] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [permissionsText, setPermissionsText] = useState('');

  useEffect(() => {
    if (!open) return;
    setUsername(initialValues?.username ?? '');
    setFullName(initialValues?.fullName ?? '');
    setPassword(initialValues?.password ?? '');
    setActive(initialValues?.active ?? true);
    setLocked(initialValues?.locked ?? false);
    setDepartmentId(initialValues?.departmentId ?? departments[0]?.id ?? '');
    setBranchId(initialValues?.branchId ?? branches[0]?.id ?? '');
    setSelectedRoles(initialValues?.roles ?? []);
    setPermissionsText(initialValues?.permissions.join(', ') ?? '');
  }, [open, initialValues, departments, branches]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      username: username.trim(),
      fullName: fullName.trim(),
      password: password.trim(),
      active,
      locked,
      departmentId,
      branchId,
      roles: selectedRoles,
      permissions: permissionsText
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    });
  }

  function toggleRole(code: string) {
    setSelectedRoles((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
    );
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create user' : 'Update user'}
      subtitle="Admin user management"
      formId="user-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create user' : 'Update user'}
      submitDisabled={
        isSubmitting ||
        username.trim() === '' ||
        fullName.trim() === '' ||
        password.trim() === '' ||
        departmentId === '' ||
        branchId === '' ||
        selectedRoles.length === 0
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Identity">
        <Field label="Username" htmlFor="user-username" required>
          <TextInput
            id="user-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="system.admin"
            required
          />
        </Field>
        <Field label="Full name" htmlFor="user-full-name" required>
          <TextInput
            id="user-full-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="System Administrator"
            required
          />
        </Field>
        <Field label="Password" htmlFor="user-password" required>
          <TextInput
            id="user-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Temporary password"
            required
          />
        </Field>
      </FormSection>

      <FormSection title="Assignment">
        <Field label="Department" htmlFor="user-department" required>
          <select
            id="user-department"
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.code} - {department.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Branch" htmlFor="user-branch" required>
          <select
            id="user-branch"
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.code} - {branch.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <div className="space-y-2">
            <ToggleField label={active ? 'Active' : 'Inactive'} checked={active} onChange={setActive} />
            <ToggleField label={locked ? 'Locked' : 'Unlocked'} checked={locked} onChange={setLocked} />
          </div>
        </Field>
      </FormSection>

      <FormSection title="Roles and permissions">
        <Field label="Roles" span={3} required>
          <div className="grid gap-2 sm:grid-cols-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.code)}
                  onChange={() => toggleRole(role.code)}
                  className="h-4 w-4 rounded border-zinc-300 text-navy focus:ring-navy"
                />
                <span>
                  {role.code} - {role.name}
                </span>
              </label>
            ))}
          </div>
        </Field>
        <Field label="Permissions" htmlFor="user-permissions" span={3}>
          <TextArea
            id="user-permissions"
            value={permissionsText}
            onChange={(event) => setPermissionsText(event.target.value)}
            placeholder="Comma-separated permissions"
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving user...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
