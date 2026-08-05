import React, { useState } from 'react';
import { FormDrawer } from '../shared/FormDrawer';
import {
  Field,
  FormSection,
  ReadOnlyValue,
  SelectInput,
  TextArea,
  TextInput,
  ToggleField } from
'../ui/Field';
import { formatCurrency } from '../../utils/cn';
import { riskEntries } from '../../data/riskRegister';
import { processFlows } from '../../data/processFlows';

const BRANCHES = [
'Borrowdale',
'Samora Machel',
'Bulawayo Main',
'Mutare',
'Gweru',
'Chinhoyi',
'Masvingo',
'Victoria Falls',
'Kwekwe',
'Avondale',
'Hwange',
'Chitungwiza'];

const DEPARTMENTS = [
'Retail Banking',
'Corporate Banking',
'Treasury',
'Operations',
'Technology',
'Compliance',
'Finance',
'Human Capital'];

const LOSS_CATEGORIES = [
'Internal fraud',
'External fraud',
'Employment practices',
'Clients, products & business practices',
'Damage to physical assets',
'Business disruption & system failure',
'Execution, delivery & process management'];

const EVENT_TYPES = ['Actual loss', 'Near miss', 'Potential loss', 'Gain event'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Open', 'Under Review', 'Escalated', 'Resolved'];
const BASEL_LINES = [
'Retail banking',
'Commercial banking',
'Trading & sales',
'Payment & settlement',
'Agency services',
'Asset management',
'Corporate finance',
'Retail brokerage'];

const FREQUENCIES = ['One-off', 'Rare', 'Occasional', 'Frequent', 'Recurring'];
const IMPACT_SEVERITY = ['None', 'Minor', 'Moderate', 'Major', 'Severe'];

interface OltsIncidentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function OltsIncidentForm({ open, onClose, onSubmit }: OltsIncidentFormProps) {
  const [grossLoss, setGrossLoss] = useState('');
  const [recoveries, setRecoveries] = useState('');
  const [customerDissatisfaction, setCustomerDissatisfaction] = useState(false);
  const [slaViolation, setSlaViolation] = useState(false);
  const [regulatoryBreach, setRegulatoryBreach] = useState(false);

  const netLoss = Math.max(0, (Number(grossLoss) || 0) - (Number(recoveries) || 0));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <FormDrawer
      open={open}
      title="Log operational loss incident"
      subtitle="OLTS · captured against the Basel operational risk taxonomy"
      formId="olts-incident-form"
      submitLabel="Submit incident"
      onClose={onClose}
      onSubmit={handleSubmit}>
      
      <FormSection title="Core details">
        <Field label="Incident ID" htmlFor="incident-id" required>
          <TextInput id="incident-id" defaultValue="OLTS-2026-04412" readOnly />
        </Field>
        <Field label="Incident date" htmlFor="incident-date" required>
          <TextInput id="incident-date" type="date" />
        </Field>
        <Field label="Discovery date" htmlFor="discovery-date" required>
          <TextInput id="discovery-date" type="date" />
        </Field>
        <Field label="Branch" htmlFor="branch" required>
          <SelectInput id="branch" options={BRANCHES} placeholder="Select branch" />
        </Field>
        <Field label="Department" htmlFor="department" required>
          <SelectInput id="department" options={DEPARTMENTS} placeholder="Select department" />
        </Field>
        <Field label="Loss category" htmlFor="loss-category" required>
          <SelectInput id="loss-category" options={LOSS_CATEGORIES} placeholder="Select category" />
        </Field>
        <Field label="Event type" htmlFor="event-type" required>
          <SelectInput id="event-type" options={EVENT_TYPES} placeholder="Select event type" />
        </Field>
        <Field label="Severity" htmlFor="severity" required>
          <SelectInput id="severity" options={SEVERITIES} placeholder="Select severity" />
        </Field>
        <Field label="Status" htmlFor="status" required>
          <SelectInput id="status" options={STATUSES} placeholder="Select status" />
        </Field>
        <Field label="Description" htmlFor="description" span={3} required>
          <TextArea id="description" placeholder="What happened, where and how it was detected" />
        </Field>
      </FormSection>

      <FormSection title="Financial impact">
        <Field label="Gross loss ($)" htmlFor="gross-loss">
          <TextInput
            id="gross-loss"
            type="number"
            min={0}
            value={grossLoss}
            onChange={(event) => setGrossLoss(event.target.value)}
            placeholder="0.00" />
          
        </Field>
        <Field label="Recoveries ($)" htmlFor="recoveries">
          <TextInput
            id="recoveries"
            type="number"
            min={0}
            value={recoveries}
            onChange={(event) => setRecoveries(event.target.value)}
            placeholder="0.00" />
          
        </Field>
        <Field label="Net loss (auto)" hint="Gross loss less recoveries">
          <ReadOnlyValue value={formatCurrency(netLoss)} />
        </Field>
      </FormSection>

      <FormSection title="Responsibility & response">
        <Field label="Responsible person" htmlFor="responsible-person" required>
          <TextInput id="responsible-person" placeholder="Full name" />
        </Field>
        <Field label="Root cause" htmlFor="root-cause" span={2}>
          <TextInput id="root-cause" placeholder="Primary cause identified" />
        </Field>
        <Field label="Corrective actions" htmlFor="corrective-actions" span={3}>
          <TextArea id="corrective-actions" placeholder="Actions taken to contain and correct" />
        </Field>
        <Field label="Preventive measures" htmlFor="preventive-measures" span={3}>
          <TextArea id="preventive-measures" placeholder="Controls introduced to prevent recurrence" />
        </Field>
      </FormSection>

      <FormSection title="Risk & control linking">
        <Field label="Link to risk" htmlFor="link-risk" span={2}>
          <SelectInput
            id="link-risk"
            options={riskEntries.map((risk) => `${risk.id} — ${risk.title}`)}
            placeholder="Select a register entry" />
          
        </Field>
        <Field label="Control ID" htmlFor="control-id">
          <TextInput id="control-id" placeholder="CTL-0000" />
        </Field>
      </FormSection>

      <FormSection title="Additional details" description="Optional — completes the regulatory record">
        <Field label="Process affected" htmlFor="process-affected">
          <SelectInput
            id="process-affected"
            options={processFlows.map((process) => process.name)}
            placeholder="Select process" />
          
        </Field>
        <Field label="Incident type" htmlFor="incident-type">
          <SelectInput
            id="incident-type"
            options={['Operational', 'Technology', 'Fraud', 'Conduct', 'Third party']}
            placeholder="Select type" />
          
        </Field>
        <Field label="Basel business line" htmlFor="basel-line">
          <SelectInput id="basel-line" options={BASEL_LINES} placeholder="Select business line" />
        </Field>
        <Field label="Frequency" htmlFor="frequency">
          <SelectInput id="frequency" options={FREQUENCIES} placeholder="Select frequency" />
        </Field>
        <Field label="Potential loss ($)" htmlFor="potential-loss">
          <TextInput id="potential-loss" type="number" min={0} placeholder="0.00" />
        </Field>
        <Field label="Customer dissatisfaction">
          <ToggleField
            label={customerDissatisfaction ? 'Reported' : 'Not reported'}
            checked={customerDissatisfaction}
            onChange={setCustomerDissatisfaction} />
          
        </Field>
        <Field label="Customer impact severity" htmlFor="customer-impact">
          <SelectInput
            id="customer-impact"
            options={IMPACT_SEVERITY}
            placeholder="Select severity"
            disabled={!customerDissatisfaction} />
          
        </Field>
        <Field label="SLA violation">
          <ToggleField
            label={slaViolation ? 'Breached' : 'No breach'}
            checked={slaViolation}
            onChange={setSlaViolation} />
          
        </Field>
        <Field label="SLA name" htmlFor="sla-name">
          <TextInput id="sla-name" placeholder="Applicable SLA" disabled={!slaViolation} />
        </Field>
        <Field label="Regulatory breach">
          <ToggleField
            label={regulatoryBreach ? 'Breached' : 'No breach'}
            checked={regulatoryBreach}
            onChange={setRegulatoryBreach} />
          
        </Field>
        <Field label="Regulation breached" htmlFor="regulation">
          <TextInput
            id="regulation"
            placeholder="e.g. Banking Act (Chapter 24:20)"
            disabled={!regulatoryBreach} />
          
        </Field>
        <Field label="Reputational impact" htmlFor="reputational-impact">
          <SelectInput id="reputational-impact" options={IMPACT_SEVERITY} placeholder="Select impact" />
        </Field>
      </FormSection>
    </FormDrawer>);

}