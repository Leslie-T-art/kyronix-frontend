import React, { useEffect, useMemo, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, ReadOnlyValue, SelectInput, TextArea, TextInput } from '../ui/Field';
import { formatCurrency } from '../../utils/cn';
import type { Branch, Department, EventType, LossCategory, OltsIncident, OltsIncidentPayload } from '../../types';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface OltsIncidentFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: OltsIncident | null;
  isSystemAdmin: boolean;
  branches: Branch[];
  departments: Department[];
  lossCategories: LossCategory[];
  eventTypes: EventType[];
  currentBranch?: Pick<Branch, 'id' | 'code' | 'name'> | null;
  currentDepartment?: Pick<Department, 'id' | 'code' | 'name'> | null;
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
  defaultDepartmentId?: string,
  defaultLossCategory?: string,
  defaultEventType?: string
): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    incidentDate: incident?.incidentDate ?? today,
    discoveryDate: incident?.discoveryDate ?? today,
    branchId: incident?.branchId ?? defaultBranchId ?? '',
    departmentId: incident?.departmentId ?? defaultDepartmentId ?? '',
    lossCategory: incident?.lossCategory ?? defaultLossCategory ?? '',
    eventType: incident?.eventType ?? defaultEventType ?? '',
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
  isSystemAdmin,
  branches,
  departments,
  lossCategories,
  eventTypes,
  currentBranch,
  currentDepartment,
  defaultBranchId,
  defaultDepartmentId,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: OltsIncidentFormProps) {
  const availableBranches = isSystemAdmin
    ? branches
    : currentBranch
      ? [{ ...currentBranch, active: true }]
      : [];
  const availableDepartments = isSystemAdmin
    ? departments
    : currentDepartment
      ? [{ ...currentDepartment, active: true }]
      : [];

  const [form, setForm] = useState<FormState>(() =>
    toFormState(
      initialValues,
      defaultBranchId,
      defaultDepartmentId,
      lossCategories[0]?.code,
      eventTypes[0]?.code
    )
  );

  useEffect(() => {
    if (!open) return;
    setForm(
      toFormState(
        initialValues,
        defaultBranchId,
        defaultDepartmentId,
        lossCategories[0]?.code,
        eventTypes[0]?.code
      )
    );
  }, [open, initialValues, defaultBranchId, defaultDepartmentId, lossCategories, eventTypes]);

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
        {isSystemAdmin && (
          <Field label="Branch" htmlFor="branch-id" required>
            <select
              id="branch-id"
              value={form.branchId}
              onChange={(event) => updateField('branchId', event.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              required
            >
              <option value="" disabled>Select branch</option>
              {availableBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} - {branch.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {isSystemAdmin && (
          <Field label="Department" htmlFor="department-id" required>
            <select
              id="department-id"
              value={form.departmentId}
              onChange={(event) => updateField('departmentId', event.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              required
            >
              <option value="" disabled>Select department</option>
              {availableDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.code} - {department.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Loss category" htmlFor="loss-category" required>
          <select
            id="loss-category"
            value={form.lossCategory}
            onChange={(event) => updateField('lossCategory', event.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            required
          >
            <option value="" disabled>Select loss category</option>
            {lossCategories.map((lossCategory) => (
              <option key={lossCategory.id} value={lossCategory.code}>
                {lossCategory.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Event type" htmlFor="event-type" required>
          <select
            id="event-type"
            value={form.eventType}
            onChange={(event) => updateField('eventType', event.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            required
          >
            <option value="" disabled>Select event type</option>
            {eventTypes.map((eventType) => (
              <option key={eventType.id} value={eventType.code}>
                {eventType.code} - {eventType.name}
              </option>
            ))}
          </select>
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
