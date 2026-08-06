import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, SelectInput, TextArea, TextInput } from '../ui/Field';
import type { KriRecord, KriRecordPayload } from '../../types';

const CATEGORIES = ['Technology', 'Operations', 'Credit', 'People', 'Compliance', 'Conduct', 'Physical Security', 'Liquidity'];
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
const DIRECTIONS = ['Higher is worse', 'Lower is worse', 'Target range'];
const ESCALATIONS = ['Head of Risk', 'Risk Committee', 'EXCO', 'Board Risk Committee'];

interface KriFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: KriRecord | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: KriRecordPayload) => Promise<void> | void;
}

interface FormState {
  indicatorName: string;
  category: string;
  owner: string;
  businessUnit: string;
  measurementFrequency: string;
  description: string;
  unitOfMeasure: string;
  target: string;
  direction: string;
  greenUpperBound: string;
  amberThreshold: string;
  redThreshold: string;
  currentValue: string;
  dataSource: string;
  nextReviewDate: string;
  linkedRisk: string;
  escalateTo: string;
  escalationTrigger: string;
}

function toFormState(values?: KriRecord | null): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    indicatorName: values?.indicatorName ?? '',
    category: values?.category ?? CATEGORIES[0],
    owner: values?.owner ?? '',
    businessUnit: values?.businessUnit ?? '',
    measurementFrequency: values?.measurementFrequency ?? FREQUENCIES[0],
    description: values?.description ?? '',
    unitOfMeasure: values?.unitOfMeasure ?? '',
    target: String(values?.target ?? 0),
    direction: values?.direction ?? DIRECTIONS[0],
    greenUpperBound: String(values?.greenUpperBound ?? 0),
    amberThreshold: String(values?.amberThreshold ?? 0),
    redThreshold: String(values?.redThreshold ?? 0),
    currentValue: String(values?.currentValue ?? 0),
    dataSource: values?.dataSource ?? '',
    nextReviewDate: values?.nextReviewDate ?? today,
    linkedRisk: values?.linkedRisk ?? '',
    escalateTo: values?.escalateTo ?? ESCALATIONS[0],
    escalationTrigger: values?.escalationTrigger ?? ''
  };
}

export function KriForm({
  open,
  mode,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: KriFormProps) {
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
      indicatorName: form.indicatorName.trim(),
      category: form.category,
      owner: form.owner.trim(),
      businessUnit: form.businessUnit.trim(),
      measurementFrequency: form.measurementFrequency,
      description: form.description.trim(),
      unitOfMeasure: form.unitOfMeasure.trim(),
      target: Number(form.target) || 0,
      direction: form.direction,
      greenUpperBound: Number(form.greenUpperBound) || 0,
      amberThreshold: Number(form.amberThreshold) || 0,
      redThreshold: Number(form.redThreshold) || 0,
      currentValue: Number(form.currentValue) || 0,
      dataSource: form.dataSource.trim(),
      nextReviewDate: form.nextReviewDate,
      linkedRisk: form.linkedRisk.trim(),
      escalateTo: form.escalateTo,
      escalationTrigger: form.escalationTrigger.trim()
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create key risk indicator' : 'Update key risk indicator'}
      subtitle="KRI service integration"
      formId="kri-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create indicator' : 'Update indicator'}
      submitDisabled={isSubmitting || form.indicatorName.trim() === '' || form.owner.trim() === ''}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Indicator definition">
        <Field label="Indicator name" htmlFor="kri-name" span={2} required>
          <TextInput id="kri-name" value={form.indicatorName} onChange={(event) => updateField('indicatorName', event.target.value)} />
        </Field>
        <Field label="Category" htmlFor="kri-category" required>
          <SelectInput id="kri-category" options={CATEGORIES} value={form.category} onChange={(event) => updateField('category', event.target.value)} />
        </Field>
        <Field label="Owner" htmlFor="kri-owner" required>
          <TextInput id="kri-owner" value={form.owner} onChange={(event) => updateField('owner', event.target.value)} />
        </Field>
        <Field label="Business unit" htmlFor="kri-unit" required>
          <TextInput id="kri-unit" value={form.businessUnit} onChange={(event) => updateField('businessUnit', event.target.value)} />
        </Field>
        <Field label="Measurement frequency" htmlFor="kri-frequency" required>
          <SelectInput id="kri-frequency" options={FREQUENCIES} value={form.measurementFrequency} onChange={(event) => updateField('measurementFrequency', event.target.value)} />
        </Field>
        <Field label="Description" htmlFor="kri-description" span={3}>
          <TextArea id="kri-description" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Thresholds and measurement">
        <Field label="Unit of measure" htmlFor="kri-unit-label" required>
          <TextInput id="kri-unit-label" value={form.unitOfMeasure} onChange={(event) => updateField('unitOfMeasure', event.target.value)} />
        </Field>
        <Field label="Target" htmlFor="kri-target" required>
          <TextInput id="kri-target" type="number" step="any" value={form.target} onChange={(event) => updateField('target', event.target.value)} />
        </Field>
        <Field label="Direction" htmlFor="kri-direction" required>
          <SelectInput id="kri-direction" options={DIRECTIONS} value={form.direction} onChange={(event) => updateField('direction', event.target.value)} />
        </Field>
        <Field label="Green upper bound" htmlFor="kri-green">
          <TextInput id="kri-green" type="number" step="any" value={form.greenUpperBound} onChange={(event) => updateField('greenUpperBound', event.target.value)} />
        </Field>
        <Field label="Amber threshold" htmlFor="kri-amber" required>
          <TextInput id="kri-amber" type="number" step="any" value={form.amberThreshold} onChange={(event) => updateField('amberThreshold', event.target.value)} />
        </Field>
        <Field label="Red threshold" htmlFor="kri-red" required>
          <TextInput id="kri-red" type="number" step="any" value={form.redThreshold} onChange={(event) => updateField('redThreshold', event.target.value)} />
        </Field>
        <Field label="Current value" htmlFor="kri-current">
          <TextInput id="kri-current" type="number" step="any" value={form.currentValue} onChange={(event) => updateField('currentValue', event.target.value)} />
        </Field>
        <Field label="Data source" htmlFor="kri-source">
          <TextInput id="kri-source" value={form.dataSource} onChange={(event) => updateField('dataSource', event.target.value)} />
        </Field>
        <Field label="Next review date" htmlFor="kri-review">
          <TextInput id="kri-review" type="date" value={form.nextReviewDate} onChange={(event) => updateField('nextReviewDate', event.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Risk linking and escalation">
        <Field label="Linked risk" htmlFor="kri-risk" span={2}>
          <TextInput id="kri-risk" value={form.linkedRisk} onChange={(event) => updateField('linkedRisk', event.target.value)} />
        </Field>
        <Field label="Escalate to" htmlFor="kri-escalate">
          <SelectInput id="kri-escalate" options={ESCALATIONS} value={form.escalateTo} onChange={(event) => updateField('escalateTo', event.target.value)} />
        </Field>
        <Field label="Escalation trigger" htmlFor="kri-trigger" span={3}>
          <TextArea id="kri-trigger" value={form.escalationTrigger} onChange={(event) => updateField('escalationTrigger', event.target.value)} />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving indicator...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
