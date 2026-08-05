import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, TextArea, TextInput, ToggleField } from '../ui/Field';
import type { RoleConfig, RoleConfigPayload } from '../../types';

interface RoleConfigFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: RoleConfig | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: RoleConfigPayload) => Promise<void> | void;
}

export function RoleConfigForm({
  open,
  mode,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: RoleConfigFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setCode(initialValues?.code ?? '');
    setName(initialValues?.name ?? '');
    setDescription(initialValues?.description ?? '');
    setActive(initialValues?.active ?? true);
  }, [open, initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
      active
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create role' : 'Update role'}
      subtitle="Admin role configuration"
      formId="role-config-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create role' : 'Update role'}
      submitDisabled={isSubmitting || code.trim() === '' || name.trim() === ''}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Role details">
        <Field label="Code" htmlFor="role-code" required>
          <TextInput
            id="role-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="SYSTEM_ADMIN"
            required
          />
        </Field>
        <Field label="Name" htmlFor="role-name" required>
          <TextInput
            id="role-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="System Administrator"
            required
          />
        </Field>
        <Field label="Status">
          <ToggleField label={active ? 'Active' : 'Inactive'} checked={active} onChange={setActive} />
        </Field>
        <Field label="Description" htmlFor="role-description" span={3}>
          <TextArea
            id="role-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what this role grants"
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving role...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
