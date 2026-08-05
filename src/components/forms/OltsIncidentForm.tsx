import React, { useEffect, useMemo, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, ReadOnlyValue, SelectInput, TextArea, TextInput } from '../ui/Field';
import { formatCurrency } from '../../utils/cn';
import type { OltsIncident, OltsIncidentPayload } from '../../types';

const LOSS_CATEGORIES = [
  'INTERNAL_FRAUD',
  'EXTERNAL_FRAUD',
  'EMPLOYMENT_PRACTICES',
  'CLIENTS_PRODUCTS_BUSINESS_PRACTICES',
  'DAMAGE_TO_PHYSICAL_ASSETS',
  'BUSINESS_DISRUPTION_SYSTEM_FAILURE',
  'EXECUTION_DELIVERY_PROCESS_MANAGEMENT'
];

const EVENT_TYPES = ['OPERATIONAL_LOSS', 'NEAR_MISS', 'POTENTIAL_LOSS', 'GAIN_EVENT'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface OltsIncidentFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: OltsIncident | null;
  defaultBranchId?: string;
  defaultDepartmentId?: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: OltsIncidentPayload) => Promise<void> | void;
}

interface FormState {
  incidentDate: string;
  discoveryDate: string;
  branchId: string;
  departmentId: string;
  lossCategory: string;
  eventType: string;
  severity: string;
  description: string;
  currencyCode: string;
  grossLoss: string;
  recoveries: string;
  potentialLoss: string;
}

function toFormState(
  incident?: OltsIncident | null,
  defaultBranchId?: string,
  defaultDepartmentId?: string
): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    incidentDate: incident?.incidentDate ?? today,
    discoveryDate: incident?.discoveryDate ?? today,
    branchId: incident?.branchId ?? defaultBranchId ?? '',
    departmentId: incident?.departmentId ?? defaultDepartmentId ?? '',
    lossCategory: incident?.lossCategory ?? LOSS_CATEGORIES[0],
    eventType: incident?.eventType ?? EVENT_TYPES[0],
    severity: incident?.severity ?? SEVERITIES[0],
    description: incident?.description ?? '',
    currencyCode: incident?.currencyCode ?? 'USD',
    grossLoss: String(incident?.grossLoss ?? 0),
    recoveries: String(incident?.recoveries ?? 0),
    potentialLoss: String(incident?.potentialLoss ?? 0)
  };
}

export function OltsIncidentForm({
  open,
  mode,
  initialValues,
  defaultBranchId,
  defaultDepartmentId,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: OltsIncidentFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    toFormState(initialValues, defaultBranchId, defaultDepartmentId)
  );

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(initialValues, defaultBranchId, defaultDepartmentId));
  }, [open, initialValues, defaultBranchId, defaultDepartmentId]);

  const netLoss = useMemo(
    () => Math.max(0, (Number(form.grossLoss) || 0) - (Number(form.recoveries) || 0)),
    [form.grossLoss, form.recoveries]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      incidentDate: form.incidentDate,
      discoveryDate: form.discoveryDate,
      branchId: form.branchId,
      departmentId: form.departmentId,
      lossCategory: form.lossCategory,
      eventType: form.eventType,
      severity: form.severity,
      description: form.description,
      currencyCode: form.currencyCode,
      grossLoss: Number(form.grossLoss) || 0,
      recoveries: Number(form.recoveries) || 0,
      potentialLoss: Number(form.potentialLoss) || 0
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create OLTS incident' : 'Update OLTS incident'}
      subtitle="OLTS API integration via centralized client"
      formId="olts-incident-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create incident' : 'Update incident'}
      submitDisabled={isSubmitting}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Core details">
        {initialValues && (
          <Field label="Incident Reference">
            <ReadOnlyValue value={initialValues.incidentId} />
          </Field>
        )}
        <Field label="Incident date" htmlFor="incident-date" required>
          <TextInput
            id="incident-date"
            type="date"
            value={form.incidentDate}
            onChange={(event) => updateField('incidentDate', event.target.value)}
            required
          />
        </Field>
        <Field label="Discovery date" htmlFor="discovery-date" required>
          <TextInput
            id="discovery-date"
            type="date"
            value={form.discoveryDate}
            onChange={(event) => updateField('discoveryDate', event.target.value)}
            required
          />
        </Field>
        <Field label="Branch ID" htmlFor="branch-id" required>
          <TextInput
            id="branch-id"
            value={form.branchId}
            onChange={(event) => updateField('branchId', event.target.value)}
            placeholder="UUID branch id"
            required
          />
        </Field>
        <Field label="Department ID" htmlFor="department-id" required>
          <TextInput
            id="department-id"
            value={form.departmentId}
            onChange={(event) => updateField('departmentId', event.target.value)}
            placeholder="UUID department id"
            required
          />
        </Field>
        <Field label="Loss category" htmlFor="loss-category" required>
          <SelectInput
            id="loss-category"
            options={LOSS_CATEGORIES}
            value={form.lossCategory}
            onChange={(event) => updateField('lossCategory', event.target.value)}
          />
        </Field>
        <Field label="Event type" htmlFor="event-type" required>
          <SelectInput
            id="event-type"
            options={EVENT_TYPES}
            value={form.eventType}
            onChange={(event) => updateField('eventType', event.target.value)}
          />
        </Field>
        <Field label="Severity" htmlFor="severity" required>
          <SelectInput
            id="severity"
            options={SEVERITIES}
            value={form.severity}
            onChange={(event) => updateField('severity', event.target.value)}
          />
        </Field>
        <Field label="Description" htmlFor="description" span={3} required>
          <TextArea
            id="description"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe the incident"
            required
          />
        </Field>
      </FormSection>

      <FormSection title="Financial impact">
        <Field label="Currency code" htmlFor="currency-code" required>
          <TextInput
            id="currency-code"
            value={form.currencyCode}
            onChange={(event) => updateField('currencyCode', event.target.value.toUpperCase())}
            placeholder="USD"
            required
          />
        </Field>
        <Field label="Gross loss" htmlFor="gross-loss" required>
          <TextInput
            id="gross-loss"
            type="number"
            min={0}
            value={form.grossLoss}
            onChange={(event) => updateField('grossLoss', event.target.value)}
            required
          />
        </Field>
        <Field label="Recoveries" htmlFor="recoveries" required>
          <TextInput
            id="recoveries"
            type="number"
            min={0}
            value={form.recoveries}
            onChange={(event) => updateField('recoveries', event.target.value)}
            required
          />
        </Field>
        <Field label="Potential loss" htmlFor="potential-loss" required>
          <TextInput
            id="potential-loss"
            type="number"
            min={0}
            value={form.potentialLoss}
            onChange={(event) => updateField('potentialLoss', event.target.value)}
            required
          />
        </Field>
        <Field label="Net loss">
          <ReadOnlyValue value={formatCurrency(netLoss, form.currencyCode || 'USD')} />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving incident...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
