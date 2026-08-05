import React, { useState } from 'react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, ReadOnlyValue, SelectInput, TextArea, TextInput } from '../ui/Field';
import { processFlows } from '../../data/processFlows';

const CATEGORIES = [
'Technology',
'Compliance',
'Credit',
'Fraud',
'Outsourcing',
'Liquidity',
'People',
'Physical Security',
'Regulatory'];

const UNITS = [
'Retail Banking',
'Corporate Banking',
'Treasury',
'Operations',
'Technology',
'Compliance',
'Finance',
'Human Capital'];

const SCALE = ['1', '2', '3', '4', '5'];
const TREATMENTS = ['Accept', 'Mitigate', 'Transfer', 'Avoid'];
const STATUSES = ['Open', 'Mitigating', 'Monitoring', 'Closed'];

function ratingFor(score: number): string {
  if (score === 0) return '—';
  if (score <= 4) return 'Low';
  if (score <= 9) return 'Medium';
  if (score <= 15) return 'High';
  return 'Critical';
}

interface RiskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function RiskForm({ open, onClose, onSubmit }: RiskFormProps) {
  const [likelihood, setLikelihood] = useState('');
  const [impact, setImpact] = useState('');

  const inherentScore = (Number(likelihood) || 0) * (Number(impact) || 0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <FormDrawer
      open={open}
      title="New risk register entry"
      subtitle="Risk Register · identification, assessment and treatment"
      formId="risk-form"
      submitLabel="Create risk"
      onClose={onClose}
      onSubmit={handleSubmit}>
      
      <FormSection title="Identification">
        <Field label="Risk ID" htmlFor="risk-id" required>
          <TextInput id="risk-id" defaultValue="RSK-0143" readOnly />
        </Field>
        <Field label="Risk title" htmlFor="risk-title" span={2} required>
          <TextInput id="risk-title" placeholder="Short, specific statement of the risk" />
        </Field>
        <Field label="Category" htmlFor="risk-category" required>
          <SelectInput id="risk-category" options={CATEGORIES} placeholder="Select category" />
        </Field>
        <Field label="Owner" htmlFor="risk-owner" required>
          <TextInput id="risk-owner" placeholder="Accountable function" />
        </Field>
        <Field label="Business unit" htmlFor="risk-unit" required>
          <SelectInput id="risk-unit" options={UNITS} placeholder="Select unit" />
        </Field>
        <Field label="Description" htmlFor="risk-description" span={3} required>
          <TextArea id="risk-description" placeholder="Cause, event and consequence" />
        </Field>
      </FormSection>

      <FormSection title="Inherent assessment">
        <Field label="Likelihood (1–5)" htmlFor="risk-likelihood" required>
          <SelectInput
            id="risk-likelihood"
            options={SCALE}
            placeholder="Select"
            value={likelihood}
            onChange={(event) => setLikelihood(event.target.value)} />
          
        </Field>
        <Field label="Impact (1–5)" htmlFor="risk-impact" required>
          <SelectInput
            id="risk-impact"
            options={SCALE}
            placeholder="Select"
            value={impact}
            onChange={(event) => setImpact(event.target.value)} />
          
        </Field>
        <Field label="Inherent rating (auto)" hint="Likelihood × impact">
          <ReadOnlyValue
            value={inherentScore ? `${ratingFor(inherentScore)} (${inherentScore})` : '—'} />
          
        </Field>
      </FormSection>

      <FormSection title="Controls & treatment">
        <Field label="Controls mapped" htmlFor="risk-controls">
          <TextInput id="risk-controls" type="number" min={0} placeholder="0" />
        </Field>
        <Field label="Control effectiveness" htmlFor="risk-effectiveness">
          <SelectInput
            id="risk-effectiveness"
            options={['Effective', 'Partially effective', 'Ineffective', 'Not tested']}
            placeholder="Select" />
          
        </Field>
        <Field label="Residual rating" htmlFor="risk-residual" required>
          <SelectInput
            id="risk-residual"
            options={['Low', 'Medium', 'High', 'Critical']}
            placeholder="Select rating" />
          
        </Field>
        <Field label="Treatment strategy" htmlFor="risk-treatment" required>
          <SelectInput id="risk-treatment" options={TREATMENTS} placeholder="Select strategy" />
        </Field>
        <Field label="Status" htmlFor="risk-status" required>
          <SelectInput id="risk-status" options={STATUSES} placeholder="Select status" />
        </Field>
        <Field label="Next review date" htmlFor="risk-review" required>
          <TextInput id="risk-review" type="date" />
        </Field>
        <Field label="Linked process" htmlFor="risk-process" span={2}>
          <SelectInput
            id="risk-process"
            options={processFlows.map((process) => `${process.id} — ${process.name}`)}
            placeholder="Select process" />
          
        </Field>
        <Field label="Linked KRI" htmlFor="risk-kri">
          <TextInput id="risk-kri" placeholder="Indicator name" />
        </Field>
        <Field label="Action plan" htmlFor="risk-action" span={3}>
          <TextArea id="risk-action" placeholder="Mitigating actions, owners and target dates" />
        </Field>
      </FormSection>
    </FormDrawer>);

}