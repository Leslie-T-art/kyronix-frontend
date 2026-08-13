import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, SelectInput, TextArea, TextInput, ToggleField } from '../ui/Field';
import type {
  Branch,
  Department,
  OltsConfigurationItem,
  OltsIncident,
  OltsIncidentPayload
} from '../../types';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface OltsIncidentFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: OltsIncident | null;
  branches: Branch[];
  departments: Department[];
  eventStatuses: OltsConfigurationItem[];
  baselEventCategories: OltsConfigurationItem[];
  rootCauses: OltsConfigurationItem[];
  controls: OltsConfigurationItem[];
  currencies: OltsConfigurationItem[];
  recoveryMethods: OltsConfigurationItem[];
  dataSources: OltsConfigurationItem[];
  actionStatuses: OltsConfigurationItem[];
  defaultBranchId?: string;
  defaultDepartmentId?: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: OltsIncidentPayload) => Promise<void> | void;
}

interface FormState {
  eventTitle: string;
  eventStatusId: string;
  incidentDate: string;
  incidentEndDate: string;
  detectionDate: string;
  branchId: string;
  departmentId: string;
  processName: string;
  productService: string;
  baselEventCategoryId: string;
  eventDescription: string;
  immediateActionTaken: string;
  rootCauseCategoryId: string;
  rootCauseDescription: string;
  controlId: string;
  failedMissingControl: boolean;
  currencyId: string;
  grossLoss: string;
  restitutionRemediationCost: string;
  recoveryMethodId: string;
  accountingGlReference: string;
  dataSourceId: string;
  nonFinancialImpactType: string;
  nonFinancialImpactDetails: string;
  overallEventSeverity: string;
  correctiveAction: string;
  actionOwner: string;
  actionTargetDate: string;
  actionStatusId: string;
  preventiveControlImplemented: boolean;
  validationEvidence: string;
  closureValidationDate: string;
  closureComment: string;
}

function toFormState(
  incident?: OltsIncident | null,
  defaultBranchId?: string,
  defaultDepartmentId?: string
): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    eventTitle: incident?.eventTitle ?? '',
    eventStatusId: incident?.eventStatusId ? String(incident.eventStatusId) : '',
    incidentDate: incident?.incidentDate ?? today,
    incidentEndDate: incident?.incidentEndDate ?? today,
    detectionDate: incident?.detectionDate ?? today,
    branchId: incident?.branchId ? String(incident.branchId) : defaultBranchId ?? '',
    departmentId: incident?.departmentId ? String(incident.departmentId) : defaultDepartmentId ?? '',
    processName: incident?.processName ?? '',
    productService: incident?.productService ?? '',
    baselEventCategoryId: incident?.baselEventCategoryId ? String(incident.baselEventCategoryId) : '',
    eventDescription: incident?.eventDescription ?? '',
    immediateActionTaken: incident?.immediateActionTaken ?? '',
    rootCauseCategoryId: incident?.rootCauseCategoryId ? String(incident.rootCauseCategoryId) : '',
    rootCauseDescription: incident?.rootCauseDescription ?? '',
    controlId: incident?.controlId ? String(incident.controlId) : '',
    failedMissingControl: incident?.failedMissingControl ?? false,
    currencyId: incident?.currencyId ? String(incident.currencyId) : '',
    grossLoss: String(incident?.grossLoss ?? 0),
    restitutionRemediationCost: String(incident?.restitutionRemediationCost ?? 0),
    recoveryMethodId: incident?.recoveryMethodId ? String(incident.recoveryMethodId) : '',
    accountingGlReference: incident?.accountingGlReference ?? '',
    dataSourceId: incident?.dataSourceId ? String(incident.dataSourceId) : '',
    nonFinancialImpactType: incident?.nonFinancialImpactType ?? '',
    nonFinancialImpactDetails: incident?.nonFinancialImpactDetails ?? '',
    overallEventSeverity: incident?.overallEventSeverity ?? SEVERITIES[0],
    correctiveAction: incident?.correctiveAction ?? '',
    actionOwner: incident?.actionOwner ?? '',
    actionTargetDate: incident?.actionTargetDate ?? today,
    actionStatusId: incident?.actionStatusId ? String(incident.actionStatusId) : '',
    preventiveControlImplemented: incident?.preventiveControlImplemented ?? false,
    validationEvidence: incident?.validationEvidence ?? '',
    closureValidationDate: incident?.closureValidationDate ?? today,
    closureComment: incident?.closureComment ?? ''
  };
}

function renderConfigOptions(items: OltsConfigurationItem[]) {
  return items.map((item) => (
    <option key={String(item.id)} value={String(item.id)}>
      {item.code} - {item.name}
    </option>
  ));
}

export function OltsIncidentForm({
  open,
  mode,
  initialValues,
  branches,
  departments,
  eventStatuses,
  baselEventCategories,
  rootCauses,
  controls,
  currencies,
  recoveryMethods,
  dataSources,
  actionStatuses,
  defaultBranchId,
  defaultDepartmentId,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: OltsIncidentFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValues, defaultBranchId, defaultDepartmentId));

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(initialValues, defaultBranchId, defaultDepartmentId));
  }, [open, initialValues, defaultBranchId, defaultDepartmentId]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      eventTitle: form.eventTitle.trim(),
      eventStatusId: Number(form.eventStatusId) || 0,
      incidentDate: form.incidentDate,
      incidentEndDate: form.incidentEndDate,
      detectionDate: form.detectionDate,
      branchId: Number(form.branchId) || 0,
      departmentId: Number(form.departmentId) || 0,
      processName: form.processName.trim(),
      productService: form.productService.trim(),
      baselEventCategoryId: Number(form.baselEventCategoryId) || 0,
      eventDescription: form.eventDescription.trim(),
      immediateActionTaken: form.immediateActionTaken.trim(),
      rootCauseCategoryId: Number(form.rootCauseCategoryId) || 0,
      rootCauseDescription: form.rootCauseDescription.trim(),
      controlId: Number(form.controlId) || 0,
      failedMissingControl: form.failedMissingControl,
      currencyId: Number(form.currencyId) || 0,
      grossLoss: Number(form.grossLoss) || 0,
      restitutionRemediationCost: Number(form.restitutionRemediationCost) || 0,
      recoveryMethodId: Number(form.recoveryMethodId) || 0,
      accountingGlReference: form.accountingGlReference.trim(),
      dataSourceId: Number(form.dataSourceId) || 0,
      nonFinancialImpactType: form.nonFinancialImpactType.trim(),
      nonFinancialImpactDetails: form.nonFinancialImpactDetails.trim(),
      overallEventSeverity: form.overallEventSeverity,
      correctiveAction: form.correctiveAction.trim(),
      actionOwner: form.actionOwner.trim(),
      actionTargetDate: form.actionTargetDate,
      actionStatusId: Number(form.actionStatusId) || 0,
      preventiveControlImplemented: form.preventiveControlImplemented,
      validationEvidence: form.validationEvidence.trim(),
      closureValidationDate: form.closureValidationDate,
      closureComment: form.closureComment.trim()
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Create OLTS incident' : 'Update OLTS incident'}
      subtitle="OLTS incident API integration"
      formId="olts-incident-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Create incident' : 'Update incident'}
      submitDisabled={isSubmitting}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Event details">
        <Field label="Event title" htmlFor="event-title" required>
          <TextInput id="event-title" value={form.eventTitle} onChange={(event) => updateField('eventTitle', event.target.value)} required />
        </Field>
        <Field label="Event status" htmlFor="event-status" required>
          <select id="event-status" value={form.eventStatusId} onChange={(event) => updateField('eventStatusId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select event status</option>
            {renderConfigOptions(eventStatuses)}
          </select>
        </Field>
        <Field label="Overall severity" htmlFor="overall-severity" required>
          <SelectInput id="overall-severity" options={SEVERITIES} value={form.overallEventSeverity} onChange={(event) => updateField('overallEventSeverity', event.target.value)} />
        </Field>
        <Field label="Incident date" htmlFor="incident-date" required>
          <TextInput id="incident-date" type="date" value={form.incidentDate} onChange={(event) => updateField('incidentDate', event.target.value)} required />
        </Field>
        <Field label="Incident end date" htmlFor="incident-end-date" required>
          <TextInput id="incident-end-date" type="date" value={form.incidentEndDate} onChange={(event) => updateField('incidentEndDate', event.target.value)} required />
        </Field>
        <Field label="Detection date" htmlFor="detection-date" required>
          <TextInput id="detection-date" type="date" value={form.detectionDate} onChange={(event) => updateField('detectionDate', event.target.value)} required />
        </Field>
        <Field label="Branch" htmlFor="branch-id" required>
          <select id="branch-id" value={form.branchId} onChange={(event) => updateField('branchId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.code} - {branch.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Department" htmlFor="department-id" required>
          <select id="department-id" value={form.departmentId} onChange={(event) => updateField('departmentId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.code} - {department.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Process name" htmlFor="process-name" required>
          <TextInput id="process-name" value={form.processName} onChange={(event) => updateField('processName', event.target.value)} required />
        </Field>
        <Field label="Product / service" htmlFor="product-service" required>
          <TextInput id="product-service" value={form.productService} onChange={(event) => updateField('productService', event.target.value)} required />
        </Field>
        <Field label="Basel event category" htmlFor="basel-event-category" required>
          <select id="basel-event-category" value={form.baselEventCategoryId} onChange={(event) => updateField('baselEventCategoryId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select Basel event category</option>
            {renderConfigOptions(baselEventCategories)}
          </select>
        </Field>
        <Field label="Event description" htmlFor="event-description" span={3} required>
          <TextArea id="event-description" value={form.eventDescription} onChange={(event) => updateField('eventDescription', event.target.value)} required />
        </Field>
        <Field label="Immediate action taken" htmlFor="immediate-action" span={3} required>
          <TextArea id="immediate-action" value={form.immediateActionTaken} onChange={(event) => updateField('immediateActionTaken', event.target.value)} required />
        </Field>
      </FormSection>

      <FormSection title="Cause and impact">
        <Field label="Root cause" htmlFor="root-cause-category" required>
          <select id="root-cause-category" value={form.rootCauseCategoryId} onChange={(event) => updateField('rootCauseCategoryId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select root cause</option>
            {renderConfigOptions(rootCauses)}
          </select>
        </Field>
        <Field label="Root cause description" htmlFor="root-cause-description" span={2} required>
          <TextArea id="root-cause-description" value={form.rootCauseDescription} onChange={(event) => updateField('rootCauseDescription', event.target.value)} required />
        </Field>
        <Field label="Control" htmlFor="control-id" required>
          <select id="control-id" value={form.controlId} onChange={(event) => updateField('controlId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select control</option>
            {renderConfigOptions(controls)}
          </select>
        </Field>
        <Field label="Failed / missing control">
          <ToggleField label={form.failedMissingControl ? 'Yes' : 'No'} checked={form.failedMissingControl} onChange={(value) => updateField('failedMissingControl', value)} />
        </Field>
        <Field label="Non-financial impact type" htmlFor="non-financial-impact-type">
          <TextInput id="non-financial-impact-type" value={form.nonFinancialImpactType} onChange={(event) => updateField('nonFinancialImpactType', event.target.value)} />
        </Field>
        <Field label="Non-financial impact details" htmlFor="non-financial-impact-details" span={2}>
          <TextArea id="non-financial-impact-details" value={form.nonFinancialImpactDetails} onChange={(event) => updateField('nonFinancialImpactDetails', event.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Financial impact and closure">
        <Field label="Currency" htmlFor="currency-id" required>
          <select id="currency-id" value={form.currencyId} onChange={(event) => updateField('currencyId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select currency</option>
            {renderConfigOptions(currencies)}
          </select>
        </Field>
        <Field label="Gross loss" htmlFor="gross-loss" required>
          <TextInput id="gross-loss" type="number" min={0} value={form.grossLoss} onChange={(event) => updateField('grossLoss', event.target.value)} required />
        </Field>
        <Field label="Restitution / remediation cost" htmlFor="restitution-cost" required>
          <TextInput id="restitution-cost" type="number" min={0} value={form.restitutionRemediationCost} onChange={(event) => updateField('restitutionRemediationCost', event.target.value)} required />
        </Field>
        <Field label="Recovery method" htmlFor="recovery-method" required>
          <select id="recovery-method" value={form.recoveryMethodId} onChange={(event) => updateField('recoveryMethodId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select recovery method</option>
            {renderConfigOptions(recoveryMethods)}
          </select>
        </Field>
        <Field label="Accounting GL reference" htmlFor="gl-reference">
          <TextInput id="gl-reference" value={form.accountingGlReference} onChange={(event) => updateField('accountingGlReference', event.target.value)} />
        </Field>
        <Field label="Data source" htmlFor="data-source" required>
          <select id="data-source" value={form.dataSourceId} onChange={(event) => updateField('dataSourceId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select data source</option>
            {renderConfigOptions(dataSources)}
          </select>
        </Field>
        <Field label="Corrective action" htmlFor="corrective-action" span={2}>
          <TextArea id="corrective-action" value={form.correctiveAction} onChange={(event) => updateField('correctiveAction', event.target.value)} />
        </Field>
        <Field label="Action owner" htmlFor="action-owner">
          <TextInput id="action-owner" value={form.actionOwner} onChange={(event) => updateField('actionOwner', event.target.value)} />
        </Field>
        <Field label="Action target date" htmlFor="action-target-date">
          <TextInput id="action-target-date" type="date" value={form.actionTargetDate} onChange={(event) => updateField('actionTargetDate', event.target.value)} />
        </Field>
        <Field label="Action status" htmlFor="action-status-id" required>
          <select id="action-status-id" value={form.actionStatusId} onChange={(event) => updateField('actionStatusId', event.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" required>
            <option value="" disabled>Select action status</option>
            {renderConfigOptions(actionStatuses)}
          </select>
        </Field>
        <Field label="Preventive control implemented">
          <ToggleField label={form.preventiveControlImplemented ? 'Yes' : 'No'} checked={form.preventiveControlImplemented} onChange={(value) => updateField('preventiveControlImplemented', value)} />
        </Field>
        <Field label="Validation evidence" htmlFor="validation-evidence" span={2}>
          <TextArea id="validation-evidence" value={form.validationEvidence} onChange={(event) => updateField('validationEvidence', event.target.value)} />
        </Field>
        <Field label="Closure validation date" htmlFor="closure-validation-date">
          <TextInput id="closure-validation-date" type="date" value={form.closureValidationDate} onChange={(event) => updateField('closureValidationDate', event.target.value)} />
        </Field>
        <Field label="Closure comment" htmlFor="closure-comment" span={2}>
          <TextArea id="closure-comment" value={form.closureComment} onChange={(event) => updateField('closureComment', event.target.value)} />
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
