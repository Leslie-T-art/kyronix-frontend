import React, { useEffect, useState } from 'react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, ReadOnlyValue, SelectInput, TextArea, TextInput } from '../ui/Field';
import { processFlows } from '../../data/processFlows';
import type { RiskRecord, RiskRecordPayload } from '../../types';

const CATEGORIES = [
  'Technology',
  'Compliance',
  'Credit',
  'Fraud',
  'Outsourcing',
  'Liquidity',
  'People',
  'Physical Security',
  'Regulatory'
];

const UNITS = [
  'Retail Banking',
  'Corporate Banking',
  'Treasury',
  'Operations',
  'Technology',
  'Compliance',
  'Finance',
  'Human Capital'
];

const SCALE = ['1', '2', '3', '4', '5'];
const TREATMENTS = ['Accept', 'Mitigate', 'Transfer', 'Avoid'];
const STATUSES = ['Open', 'Mitigating', 'Monitoring', 'Closed'];
const EFFECTIVENESS = ['Effective', 'Partially effective', 'Ineffective', 'Not tested'];

const EMPTY_FORM: RiskRecordPayload = {
  riskTitle: '',
  category: '',
  owner: '',
  businessUnit: '',
  description: '',
  likelihood: 0,
  impact: 0,
  inherentRating: '',
  controlsMapped: '',
  controlEffectiveness: '',
  residualRating: '',
  treatmentStrategy: '',
  status: '',
  nextReviewDate: '',
  linkedProcess: '',
  linkedKri: '',
  actionPlan: ''
};

function ratingFor(score: number): string {
  if (score === 0) return '';
  if (score <= 4) return 'Low';
  if (score <= 9) return 'Medium';
  if (score <= 15) return 'High';
  return 'Critical';
}

function toPayload(record: RiskRecord | null | undefined): RiskRecordPayload {
  if (!record) return EMPTY_FORM;
  return {
    riskTitle: record.riskTitle ?? '',
    category: record.category ?? '',
    owner: record.owner ?? '',
    businessUnit: record.businessUnit ?? '',
    description: record.description ?? '',
    likelihood: record.likelihood ?? 0,
    impact: record.impact ?? 0,
    inherentRating: record.inherentRating ?? '',
    controlsMapped: record.controlsMapped ?? '',
    controlEffectiveness: record.controlEffectiveness ?? '',
    residualRating: record.residualRating ?? '',
    treatmentStrategy: record.treatmentStrategy ?? '',
    status: record.status ?? '',
    nextReviewDate: record.nextReviewDate ?? '',
    linkedProcess: record.linkedProcess ?? '',
    linkedKri: record.linkedKri ?? '',
    actionPlan: record.actionPlan ?? ''
  };
}

interface RiskFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: RiskRecord | null;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: RiskRecordPayload) => Promise<void> | void;
}

export function RiskForm({
  open,
  mode,
  initialValue,
  busy = false,
  error = null,
  onClose,
  onSubmit
}: RiskFormProps) {
  const [form, setForm] = useState<RiskRecordPayload>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(toPayload(initialValue));
  }, [open, initialValue, mode]);

  const inherentScore = (Number(form.likelihood) || 0) * (Number(form.impact) || 0);
  const computedInherentRating = ratingFor(inherentScore);

  function update<K extends keyof RiskRecordPayload>(key: K, value: RiskRecordPayload[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'likelihood' || key === 'impact') {
        const score = (Number(next.likelihood) || 0) * (Number(next.impact) || 0);
        next.inherentRating = ratingFor(score);
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      ...form,
      likelihood: Number(form.likelihood) || 0,
      impact: Number(form.impact) || 0,
      inherentRating: computedInherentRating
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'New risk register entry' : 'Edit risk register entry'}
      subtitle="Risk Register · identification, assessment and treatment"
      formId="risk-form"
      submitLabel={mode === 'create' ? 'Create risk' : 'Save changes'}
      submitDisabled={busy}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Identification">
        {mode === 'edit' && initialValue ? (
          <Field label="Risk ID">
            <ReadOnlyValue value={initialValue.riskId} />
          </Field>
        ) : null}
        <Field label="Risk title" htmlFor="risk-title" span={2} required>
          <TextInput
            id="risk-title"
            value={form.riskTitle}
            onChange={(event) => update('riskTitle', event.target.value)}
            placeholder="Short, specific statement of the risk"
            disabled={busy}
          />
        </Field>
        <Field label="Category" htmlFor="risk-category" required>
          <SelectInput
            id="risk-category"
            options={CATEGORIES}
            placeholder="Select category"
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Owner" htmlFor="risk-owner" required>
          <TextInput
            id="risk-owner"
            value={form.owner}
            onChange={(event) => update('owner', event.target.value)}
            placeholder="Accountable function"
            disabled={busy}
          />
        </Field>
        <Field label="Business unit" htmlFor="risk-unit" required>
          <SelectInput
            id="risk-unit"
            options={UNITS}
            placeholder="Select unit"
            value={form.businessUnit}
            onChange={(event) => update('businessUnit', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Description" htmlFor="risk-description" span={3} required>
          <TextArea
            id="risk-description"
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Cause, event and consequence"
            disabled={busy}
          />
        </Field>
      </FormSection>

      <FormSection title="Inherent assessment">
        <Field label="Likelihood (1–5)" htmlFor="risk-likelihood" required>
          <SelectInput
            id="risk-likelihood"
            options={SCALE}
            placeholder="Select"
            value={form.likelihood ? String(form.likelihood) : ''}
            onChange={(event) => update('likelihood', Number(event.target.value) || 0)}
            disabled={busy}
          />
        </Field>
        <Field label="Impact (1–5)" htmlFor="risk-impact" required>
          <SelectInput
            id="risk-impact"
            options={SCALE}
            placeholder="Select"
            value={form.impact ? String(form.impact) : ''}
            onChange={(event) => update('impact', Number(event.target.value) || 0)}
            disabled={busy}
          />
        </Field>
        <Field label="Inherent rating (auto)" hint="Likelihood × impact">
          <ReadOnlyValue value={computedInherentRating ? `${computedInherentRating} (${inherentScore})` : '—'} />
        </Field>
      </FormSection>

      <FormSection title="Controls & treatment">
        <Field label="Controls mapped" htmlFor="risk-controls">
          <TextInput
            id="risk-controls"
            value={form.controlsMapped}
            onChange={(event) => update('controlsMapped', event.target.value)}
            placeholder="List the control set or reference IDs"
            disabled={busy}
          />
        </Field>
        <Field label="Control effectiveness" htmlFor="risk-effectiveness">
          <SelectInput
            id="risk-effectiveness"
            options={EFFECTIVENESS}
            placeholder="Select"
            value={form.controlEffectiveness}
            onChange={(event) => update('controlEffectiveness', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Residual rating" htmlFor="risk-residual" required>
          <SelectInput
            id="risk-residual"
            options={['Low', 'Medium', 'High', 'Critical']}
            placeholder="Select rating"
            value={form.residualRating}
            onChange={(event) => update('residualRating', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Treatment strategy" htmlFor="risk-treatment" required>
          <SelectInput
            id="risk-treatment"
            options={TREATMENTS}
            placeholder="Select strategy"
            value={form.treatmentStrategy}
            onChange={(event) => update('treatmentStrategy', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Status" htmlFor="risk-status" required>
          <SelectInput
            id="risk-status"
            options={STATUSES}
            placeholder="Select status"
            value={form.status}
            onChange={(event) => update('status', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Next review date" htmlFor="risk-review" required>
          <TextInput
            id="risk-review"
            type="date"
            value={form.nextReviewDate}
            onChange={(event) => update('nextReviewDate', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Linked process" htmlFor="risk-process" span={2}>
          <SelectInput
            id="risk-process"
            options={processFlows.map((process) => `${process.id} — ${process.name}`)}
            placeholder="Select process"
            value={form.linkedProcess}
            onChange={(event) => update('linkedProcess', event.target.value)}
            disabled={busy}
          />
        </Field>
        <Field label="Linked KRI" htmlFor="risk-kri">
          <TextInput
            id="risk-kri"
            value={form.linkedKri}
            onChange={(event) => update('linkedKri', event.target.value)}
            placeholder="Indicator name"
            disabled={busy}
          />
        </Field>
        <Field label="Action plan" htmlFor="risk-action" span={3}>
          <TextArea
            id="risk-action"
            value={form.actionPlan}
            onChange={(event) => update('actionPlan', event.target.value)}
            placeholder="Mitigating actions, owners and target dates"
            disabled={busy}
          />
        </Field>
      </FormSection>

      {error ? (
        <div className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}
    </FormDrawer>
  );
}
