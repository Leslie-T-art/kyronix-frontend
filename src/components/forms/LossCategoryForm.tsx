import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, TextArea, TextInput } from '../ui/Field';
import type { LossCategory, LossCategoryPayload } from '../../types';

interface LossCategoryFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: LossCategory | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: LossCategoryPayload) => Promise<void> | void;
}

export function LossCategoryForm({
  open,
  mode,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: LossCategoryFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setCode(initialValues?.code ?? '');
    setName(initialValues?.name ?? '');
    setDescription(initialValues?.description ?? '');
  }, [open, initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim()
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create loss category' : 'Update loss category'}
      subtitle="OLTS reference data"
      formId="loss-category-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create loss category' : 'Update loss category'}
      submitDisabled={isSubmitting || code.trim() === '' || name.trim() === '' || description.trim() === ''}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Loss category details">
        <Field label="Code" htmlFor="loss-category-code" required>
          <TextInput
            id="loss-category-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="INTERNAL_FRAUD"
            required
          />
        </Field>
        <Field label="Name" htmlFor="loss-category-name" required>
          <TextInput
            id="loss-category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Internal Fraud"
            required
          />
        </Field>
        <Field label="Description" htmlFor="loss-category-description" span={3} required>
          <TextArea
            id="loss-category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the loss category"
            required
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving loss category...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
