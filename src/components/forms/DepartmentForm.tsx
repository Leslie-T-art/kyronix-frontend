import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, TextInput, ToggleField } from '../ui/Field';
import type { Department, DepartmentPayload } from '../../types';

interface DepartmentFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: Department | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: DepartmentPayload) => Promise<void> | void;
}

export function DepartmentForm({
  open,
  mode,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: DepartmentFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setCode(initialValues?.code ?? '');
    setName(initialValues?.name ?? '');
    setActive(initialValues?.active ?? true);
  }, [open, initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      code: code.trim(),
      name: name.trim(),
      active
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create department' : 'Update department'}
      subtitle="Admin reference data"
      formId="department-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create department' : 'Update department'}
      submitDisabled={isSubmitting || code.trim() === '' || name.trim() === ''}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Department details">
        <Field label="Code" htmlFor="department-code" required>
          <TextInput
            id="department-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="OPS"
            required
          />
        </Field>
        <Field label="Name" htmlFor="department-name" required>
          <TextInput
            id="department-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Operations"
            required
          />
        </Field>
        <Field label="Status">
          <ToggleField
            label={active ? 'Active' : 'Inactive'}
            checked={active}
            onChange={setActive}
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving department...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
