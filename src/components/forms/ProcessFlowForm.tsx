import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, SelectInput, TextArea, TextInput } from '../ui/Field';
import { Button } from '../ui/Button';
import { riskEntries } from '../../data/riskRegister';

const DEPARTMENTS = [
'Retail Banking',
'Corporate Banking',
'Treasury',
'Operations',
'Technology',
'Compliance',
'Finance',
'Procurement',
'Operational Risk'];

const STATUSES = ['Draft', 'In Review', 'Approved', 'Expired'];
const CRITICALITY = ['Low', 'Medium', 'High', 'Critical'];

interface ProcessFlowFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ProcessFlowForm({ open, onClose, onSubmit }: ProcessFlowFormProps) {
  const [steps, setSteps] = useState([{ id: 1 }]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <FormDrawer
      open={open}
      title="New process flow"
      subtitle="Process Flows · document the process, its steps and control points"
      formId="process-form"
      submitLabel="Create process"
      onClose={onClose}
      onSubmit={handleSubmit}>
      
      <FormSection title="Process details">
        <Field label="Process ID" htmlFor="process-id" required>
          <TextInput id="process-id" defaultValue="PRC-022" readOnly />
        </Field>
        <Field label="Process name" htmlFor="process-name" span={2} required>
          <TextInput id="process-name" placeholder="e.g. Retail account opening" />
        </Field>
        <Field label="Department" htmlFor="process-department" required>
          <SelectInput id="process-department" options={DEPARTMENTS} placeholder="Select department" />
        </Field>
        <Field label="Process owner" htmlFor="process-owner" required>
          <TextInput id="process-owner" placeholder="Full name" />
        </Field>
        <Field label="Version" htmlFor="process-version" required>
          <TextInput id="process-version" placeholder="v1.0" />
        </Field>
        <Field label="Criticality" htmlFor="process-criticality">
          <SelectInput id="process-criticality" options={CRITICALITY} placeholder="Select" />
        </Field>
        <Field label="Status" htmlFor="process-status" required>
          <SelectInput id="process-status" options={STATUSES} placeholder="Select status" />
        </Field>
        <Field label="Next review date" htmlFor="process-review" required>
          <TextInput id="process-review" type="date" />
        </Field>
        <Field label="Purpose" htmlFor="process-purpose" span={3}>
          <TextArea id="process-purpose" placeholder="What the process achieves and its boundaries" />
        </Field>
      </FormSection>

      <FormSection title="Risk linking">
        <Field label="Linked risks" htmlFor="process-risks" span={2}>
          <SelectInput
            id="process-risks"
            options={riskEntries.map((risk) => `${risk.id} — ${risk.title}`)}
            placeholder="Select a register entry" />
          
        </Field>
        <Field label="Key control count" htmlFor="process-controls">
          <TextInput id="process-controls" type="number" min={0} placeholder="0" />
        </Field>
      </FormSection>

      <section className="rounded-xl border border-zinc-200 p-4">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-navy">Process steps</h3>
            <p className="mt-0.5 text-[11px] text-zinc-500">Step, performing actor and its control</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSteps((current) => [...current, { id: Date.now() }])}>
            
            <PlusIcon className="h-3.5 w-3.5" />
            Add step
          </Button>
        </header>

        <div className="space-y-3">
          {steps.map((step, index) =>
          <div key={step.id} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={`Step ${index + 1} name`}>
                <TextInput placeholder="e.g. KYC document verification" />
              </Field>
              <Field label="Actor">
                <TextInput placeholder="Role performing the step" />
              </Field>
              <Field label="Control">
                <div className="flex items-center gap-2">
                  <TextInput placeholder="Control applied" />
                  {steps.length > 1 &&
                <button
                  type="button"
                  aria-label={`Remove step ${index + 1}`}
                  onClick={() =>
                  setSteps((current) => current.filter((item) => item.id !== step.id))
                  }
                  className="rounded-xl border border-zinc-200 p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-700">
                  
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                }
                </div>
              </Field>
            </div>
          )}
        </div>
      </section>
    </FormDrawer>);

}