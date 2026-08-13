import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import type { Department, ProcessFlowPayload, ProcessFlowRecord } from '../../types';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, TextArea, TextInput } from '../ui/Field';

interface ProcessFlowFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  departments: Department[];
  initialValues?: ProcessFlowRecord | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: ProcessFlowPayload) => Promise<void> | void;
}

interface FormState {
  processFlowName: string;
  departmentId: string;
  description: string;
  validFromDate: string;
  validToDate: string;
  document: File | null;
}

function toFormState(initialValues?: ProcessFlowRecord | null): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    processFlowName: initialValues?.processFlowName ?? '',
    departmentId: initialValues?.departmentId ? String(initialValues.departmentId) : '',
    description: initialValues?.description ?? '',
    validFromDate: initialValues?.validFromDate ?? today,
    validToDate: initialValues?.validToDate ?? today,
    document: null
  };
}

export function ProcessFlowForm({
  open,
  mode,
  departments,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: ProcessFlowFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValues));

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(initialValues));
  }, [open, initialValues]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      processFlowName: form.processFlowName.trim(),
      departmentId: Number(form.departmentId) || 0,
      description: form.description.trim(),
      validFromDate: form.validFromDate,
      validToDate: form.validToDate,
      document: form.document
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create process flow' : 'Update process flow'}
      subtitle="Process flow API integration"
      formId="process-flow-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create process flow' : 'Update process flow'}
      submitDisabled={isSubmitting || form.processFlowName.trim() === '' || form.departmentId === '' || form.validFromDate === '' || form.validToDate === ''}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Process flow details">
        <Field label="Process flow name" htmlFor="process-flow-name" required>
          <TextInput
            id="process-flow-name"
            value={form.processFlowName}
            onChange={(event) => updateField('processFlowName', event.target.value)}
            placeholder="Retail account opening"
            required
          />
        </Field>
        <Field label="Department" htmlFor="process-flow-department" required>
          <select
            id="process-flow-department"
            value={form.departmentId}
            onChange={(event) => updateField('departmentId', event.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            required
          >
            <option value="" disabled>
              Select department
            </option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.code} - {department.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valid from date" htmlFor="process-flow-valid-from" required>
          <TextInput
            id="process-flow-valid-from"
            type="date"
            value={form.validFromDate}
            onChange={(event) => updateField('validFromDate', event.target.value)}
            required
          />
        </Field>
        <Field label="Valid to date" htmlFor="process-flow-valid-to" required>
          <TextInput
            id="process-flow-valid-to"
            type="date"
            value={form.validToDate}
            onChange={(event) => updateField('validToDate', event.target.value)}
            required
          />
        </Field>
        <Field label="Description" htmlFor="process-flow-description" span={3}>
          <TextArea
            id="process-flow-description"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe the process flow and its boundaries"
          />
        </Field>
        <Field
          label="Document"
          htmlFor="process-flow-document"
          span={3}
          hint={initialValues?.originalFileName ? `Current file: ${initialValues.originalFileName}` : 'Upload the source process flow document'}
        >
          <input
            id="process-flow-document"
            type="file"
            onChange={(event) => updateField('document', event.target.files?.[0] ?? null)}
            className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving process flow...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
