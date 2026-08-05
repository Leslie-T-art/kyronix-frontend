import React from 'react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, SelectInput, TextArea, TextInput } from '../ui/Field';
import { riskEntries } from '../../data/riskRegister';

const CATEGORIES = [
'Technology',
'Operations',
'Credit',
'People',
'Compliance',
'Conduct',
'Physical Security',
'Liquidity'];

const UNITS = [
'Retail Banking',
'Corporate Banking',
'Treasury',
'Operations',
'Technology',
'Compliance',
'Finance',
'Human Capital'];

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
const DIRECTIONS = ['Higher is worse', 'Lower is worse'];

interface KriFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function KriForm({ open, onClose, onSubmit }: KriFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <FormDrawer
      open={open}
      title="New key risk indicator"
      subtitle="KRI · define the metric, thresholds and reporting cadence"
      formId="kri-form"
      submitLabel="Create indicator"
      onClose={onClose}
      onSubmit={handleSubmit}>
      
      <FormSection title="Indicator definition">
        <Field label="Indicator name" htmlFor="kri-name" span={2} required>
          <TextInput id="kri-name" placeholder="e.g. Failed ATM transactions" />
        </Field>
        <Field label="Category" htmlFor="kri-category" required>
          <SelectInput id="kri-category" options={CATEGORIES} placeholder="Select category" />
        </Field>
        <Field label="Owner" htmlFor="kri-owner" required>
          <TextInput id="kri-owner" placeholder="Accountable function" />
        </Field>
        <Field label="Business unit" htmlFor="kri-unit" required>
          <SelectInput id="kri-unit" options={UNITS} placeholder="Select unit" />
        </Field>
        <Field label="Measurement frequency" htmlFor="kri-frequency" required>
          <SelectInput id="kri-frequency" options={FREQUENCIES} placeholder="Select frequency" />
        </Field>
        <Field label="Description" htmlFor="kri-description" span={3}>
          <TextArea id="kri-description" placeholder="What the indicator measures and why it matters" />
        </Field>
      </FormSection>

      <FormSection title="Thresholds & measurement">
        <Field label="Unit of measure" htmlFor="kri-unit-label" required>
          <TextInput id="kri-unit-label" placeholder="e.g. % of volume" />
        </Field>
        <Field label="Target" htmlFor="kri-target" required>
          <TextInput id="kri-target" type="number" step="any" placeholder="0" />
        </Field>
        <Field label="Direction" htmlFor="kri-direction">
          <SelectInput id="kri-direction" options={DIRECTIONS} placeholder="Select direction" />
        </Field>
        <Field label="Green upper bound" htmlFor="kri-green">
          <TextInput id="kri-green" type="number" step="any" placeholder="0" />
        </Field>
        <Field label="Amber threshold" htmlFor="kri-amber" required>
          <TextInput id="kri-amber" type="number" step="any" placeholder="0" />
        </Field>
        <Field label="Red threshold" htmlFor="kri-red" required>
          <TextInput id="kri-red" type="number" step="any" placeholder="0" />
        </Field>
        <Field label="Current value" htmlFor="kri-current">
          <TextInput id="kri-current" type="number" step="any" placeholder="0" />
        </Field>
        <Field label="Data source" htmlFor="kri-source">
          <TextInput id="kri-source" placeholder="System or report" />
        </Field>
        <Field label="Next review date" htmlFor="kri-review">
          <TextInput id="kri-review" type="date" />
        </Field>
      </FormSection>

      <FormSection title="Risk linking & escalation">
        <Field label="Link to risk" htmlFor="kri-risk" span={2}>
          <SelectInput
            id="kri-risk"
            options={riskEntries.map((risk) => `${risk.id} — ${risk.title}`)}
            placeholder="Select a register entry" />
          
        </Field>
        <Field label="Escalate to" htmlFor="kri-escalate">
          <SelectInput
            id="kri-escalate"
            options={['Head of Risk', 'Risk Committee', 'EXCO', 'Board Risk Committee']}
            placeholder="Select forum" />
          
        </Field>
        <Field label="Escalation trigger" htmlFor="kri-trigger" span={3}>
          <TextArea id="kri-trigger" placeholder="Action required when the red threshold is breached" />
        </Field>
      </FormSection>
    </FormDrawer>);

}