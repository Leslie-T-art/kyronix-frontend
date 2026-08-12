import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, TextArea, TextInput } from '../ui/Field';
import type { OltsConfigurationItem, OltsConfigurationItemPayload } from '../../types';

interface OltsConfigurationItemFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  entityLabel: string;
  initialValues?: OltsConfigurationItem | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: OltsConfigurationItemPayload) => Promise<void> | void;
}

export function OltsConfigurationItemForm({
  open,
  mode,
  entityLabel,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: OltsConfigurationItemFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  useEffect(() => {
    if (!open) return;
    setCode(initialValues?.code ?? '');
    setName(initialValues?.name ?? '');
    setDescription(initialValues?.description ?? '');
    setDisplayOrder(String(initialValues?.displayOrder ?? 0));
  }, [open, initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
      displayOrder: Number(displayOrder) || 0
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? `Create ${entityLabel}` : `Update ${entityLabel}`}
      subtitle="OLTS system configuration"
      formId="olts-configuration-item-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? `Create ${entityLabel}` : `Update ${entityLabel}`}
      submitDisabled={isSubmitting || code.trim() === '' || name.trim() === ''}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Configuration details">
        <Field label="Code" htmlFor="config-code" required>
          <TextInput
            id="config-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="CODE"
            required
          />
        </Field>
        <Field label="Name" htmlFor="config-name" required>
          <TextInput
            id="config-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={entityLabel}
            required
          />
        </Field>
        <Field label="Display order" htmlFor="config-display-order" required>
          <TextInput
            id="config-display-order"
            type="number"
            min={0}
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
            required
          />
        </Field>
        <Field label="Description" htmlFor="config-description" span={3}>
          <TextArea
            id="config-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={`Describe the ${entityLabel.toLowerCase()}`}
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving {entityLabel.toLowerCase()}...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
