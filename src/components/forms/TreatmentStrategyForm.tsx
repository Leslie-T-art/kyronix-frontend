import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import type { TreatmentStrategy, TreatmentStrategyPayload } from '../../types';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, SelectInput, TextInput } from '../ui/Field';

const STATUS_OPTIONS = ['Active', 'Inactive'];

interface TreatmentStrategyFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: TreatmentStrategy | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: TreatmentStrategyPayload) => Promise<void> | void;
}

export function TreatmentStrategyForm({
  open,
  mode,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: TreatmentStrategyFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (!open) return;
    setCode(initialValues?.code ?? '');
    setName(initialValues?.name ?? '');
    setStatus(initialValues?.status ?? 'Active');
  }, [initialValues, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      code: code.trim(),
      name: name.trim(),
      status: status.trim()
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create treatment strategy' : 'Update treatment strategy'}
      subtitle="KRI treatment strategy configuration"
      formId="treatment-strategy-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create treatment strategy' : 'Update treatment strategy'}
      submitDisabled={isSubmitting || code.trim() === '' || name.trim() === '' || status.trim() === ''}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Strategy details">
        <Field label="Code" htmlFor="treatment-strategy-code" required>
          <TextInput
            id="treatment-strategy-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="STRATEGY_CODE"
            required
          />
        </Field>
        <Field label="Name" htmlFor="treatment-strategy-name" required>
          <TextInput
            id="treatment-strategy-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Treatment strategy"
            required
          />
        </Field>
        <Field label="Status" htmlFor="treatment-strategy-status" required>
          <SelectInput
            id="treatment-strategy-status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            placeholder="Select status"
            required
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving treatment strategy...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
