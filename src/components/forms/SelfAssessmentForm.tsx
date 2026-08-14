import React, { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FormDrawer } from '../shared/FormDrawer';
import { Field, FormSection, SelectInput, TextArea, TextInput, ToggleField } from '../ui/Field';
import type { Department, SelfAssessment, SelfAssessmentPayload } from '../../types';

const SCALE = ['1', '2', '3', '4', '5'];

interface SelfAssessmentFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  departments: Department[];
  riskOptions: string[];
  residualImpactOptions: string[];
  controlsOptions: string[];
  linkedActionOptions: string[];
  linkedKriOptions: string[];
  linkedOltsEventOptions: string[];
  initialValues?: SelfAssessment | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: SelfAssessmentPayload) => Promise<void> | void;
}

interface FormState {
  assessmentPeriod: string;
  departmentId: string;
  processName: string;
  riskRegisterRisk: string;
  riskScenario: string;
  cause: string;
  consequenceImpact: string;
  inherentImpact: string;
  inherentLikelihood: string;
  linkedControls: string;
  controlDesignEffectiveness: string;
  controlOperatingEffectiveness: string;
  overallControlEffectiveness: string;
  residualImpact: string;
  residualLikelihood: string;
  riskResponse: string;
  actionRequired: boolean;
  linkedAction: string;
  linkedKris: string;
  linkedOltsEvents: string;
  linkedIssuesFindings: string;
  businessReviewStatus: string;
  riskReviewVerification: string;
  riskReviewComment: string;
  dateOfLastReview: string;
  nextReviewDate: string;
}

function firstValue(values?: string[]): string {
  return values?.[0] ?? '';
}

function toSingleValueArray(value: string): string[] {
  return value.trim() ? [value.trim()] : [];
}

function toFormState(initialValues?: SelfAssessment | null): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    assessmentPeriod: initialValues?.assessmentPeriod ?? '',
    departmentId: initialValues?.departmentId ? String(initialValues.departmentId) : '',
    processName: initialValues?.processName ?? '',
    riskRegisterRisk: initialValues?.riskRegisterRisk ?? '',
    riskScenario: initialValues?.riskScenario ?? '',
    cause: initialValues?.cause ?? '',
    consequenceImpact: initialValues?.consequenceImpact ?? '',
    inherentImpact: initialValues?.inherentImpact ? String(initialValues.inherentImpact) : '',
    inherentLikelihood: initialValues?.inherentLikelihood ? String(initialValues.inherentLikelihood) : '',
    linkedControls: firstValue(initialValues?.linkedControls),
    controlDesignEffectiveness: initialValues?.controlDesignEffectiveness ?? '',
    controlOperatingEffectiveness: initialValues?.controlOperatingEffectiveness ?? '',
    overallControlEffectiveness: initialValues?.overallControlEffectiveness ?? '',
    residualImpact: initialValues?.residualImpact ? String(initialValues.residualImpact) : '',
    residualLikelihood: initialValues?.residualLikelihood ? String(initialValues.residualLikelihood) : '',
    riskResponse: initialValues?.riskResponse ?? '',
    actionRequired: initialValues?.actionRequired ?? false,
    linkedAction: initialValues?.linkedAction ?? '',
    linkedKris: firstValue(initialValues?.linkedKris),
    linkedOltsEvents: firstValue(initialValues?.linkedOltsEvents),
    linkedIssuesFindings: firstValue(initialValues?.linkedIssuesFindings),
    businessReviewStatus: initialValues?.businessReviewStatus ?? '',
    riskReviewVerification: initialValues?.riskReviewVerification ?? '',
    riskReviewComment: initialValues?.riskReviewComment ?? '',
    dateOfLastReview: initialValues?.dateOfLastReview ?? today,
    nextReviewDate: initialValues?.nextReviewDate ?? today
  };
}

export function SelfAssessmentForm({
  open,
  mode,
  departments,
  riskOptions,
  residualImpactOptions,
  controlsOptions,
  linkedActionOptions,
  linkedKriOptions,
  linkedOltsEventOptions,
  initialValues,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit
}: SelfAssessmentFormProps) {
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
      assessmentPeriod: form.assessmentPeriod.trim(),
      departmentId: Number(form.departmentId) || 0,
      processName: form.processName.trim(),
      riskRegisterRisk: form.riskRegisterRisk.trim(),
      riskScenario: form.riskScenario.trim(),
      cause: form.cause.trim(),
      consequenceImpact: form.consequenceImpact.trim(),
      inherentImpact: Number(form.inherentImpact) || 0,
      inherentLikelihood: Number(form.inherentLikelihood) || 0,
      linkedControls: toSingleValueArray(form.linkedControls),
      controlDesignEffectiveness: form.controlDesignEffectiveness.trim(),
      controlOperatingEffectiveness: form.controlOperatingEffectiveness.trim(),
      overallControlEffectiveness: form.overallControlEffectiveness.trim(),
      residualImpact: Number(form.residualImpact) || 0,
      residualLikelihood: Number(form.residualLikelihood) || 0,
      riskResponse: form.riskResponse.trim(),
      actionRequired: form.actionRequired,
      linkedAction: form.linkedAction.trim(),
      linkedKris: toSingleValueArray(form.linkedKris),
      linkedOltsEvents: toSingleValueArray(form.linkedOltsEvents),
      linkedIssuesFindings: toSingleValueArray(form.linkedIssuesFindings),
      businessReviewStatus: form.businessReviewStatus.trim(),
      riskReviewVerification: form.riskReviewVerification.trim(),
      riskReviewComment: form.riskReviewComment.trim(),
      dateOfLastReview: form.dateOfLastReview,
      nextReviewDate: form.nextReviewDate
    });
  }

  return (
    <FormDrawer
      open={open}
      title={mode === 'create' ? 'Launch self assessment' : 'Update self assessment'}
      subtitle="Self Assessment API integration"
      formId="self-assessment-form"
      submitLabel={isSubmitting ? 'Saving...' : mode === 'create' ? 'Launch assessment' : 'Update assessment'}
      submitDisabled={isSubmitting}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSection title="Assessment details">
        <Field label="Assessment period" htmlFor="assessment-period" required>
          <TextInput
            id="assessment-period"
            value={form.assessmentPeriod}
            onChange={(event) => updateField('assessmentPeriod', event.target.value)}
            placeholder="2026 Q3"
            required
          />
        </Field>
        <Field label="Department" htmlFor="assessment-department" required>
          <select
            id="assessment-department"
            value={form.departmentId}
            onChange={(event) => updateField('departmentId', event.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            required
          >
            <option value="" disabled>Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.code} - {department.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Process name" htmlFor="process-name" required>
          <TextInput
            id="process-name"
            value={form.processName}
            onChange={(event) => updateField('processName', event.target.value)}
            required
          />
        </Field>
        <Field label="Risk register risk" htmlFor="risk-register-risk" required>
          <SelectInput
            id="risk-register-risk"
            options={riskOptions}
            placeholder="Select risk"
            value={form.riskRegisterRisk}
            onChange={(event) => updateField('riskRegisterRisk', event.target.value)}
            required
          />
        </Field>
        <Field label="Risk scenario" htmlFor="risk-scenario" span={2} required>
          <TextArea
            id="risk-scenario"
            value={form.riskScenario}
            onChange={(event) => updateField('riskScenario', event.target.value)}
            required
          />
        </Field>
        <Field label="Cause" htmlFor="risk-cause" span={2} required>
          <TextArea
            id="risk-cause"
            value={form.cause}
            onChange={(event) => updateField('cause', event.target.value)}
            required
          />
        </Field>
        <Field label="Consequence / impact" htmlFor="consequence-impact" span={2} required>
          <TextArea
            id="consequence-impact"
            value={form.consequenceImpact}
            onChange={(event) => updateField('consequenceImpact', event.target.value)}
            required
          />
        </Field>
      </FormSection>

      <FormSection title="Risk scoring">
        <Field label="Inherent impact" htmlFor="inherent-impact" required>
          <SelectInput
            id="inherent-impact"
            options={SCALE}
            value={form.inherentImpact}
            onChange={(event) => updateField('inherentImpact', event.target.value)}
          />
        </Field>
        <Field label="Inherent likelihood" htmlFor="inherent-likelihood" required>
          <SelectInput
            id="inherent-likelihood"
            options={SCALE}
            value={form.inherentLikelihood}
            onChange={(event) => updateField('inherentLikelihood', event.target.value)}
          />
        </Field>
        <Field label="Residual impact" htmlFor="residual-impact" required>
          <SelectInput
            id="residual-impact"
            options={residualImpactOptions}
            value={form.residualImpact}
            onChange={(event) => updateField('residualImpact', event.target.value)}
          />
        </Field>
        <Field label="Residual likelihood" htmlFor="residual-likelihood" required>
          <SelectInput
            id="residual-likelihood"
            options={SCALE}
            value={form.residualLikelihood}
            onChange={(event) => updateField('residualLikelihood', event.target.value)}
          />
        </Field>
        <Field label="Risk response" htmlFor="risk-response" required>
          <TextInput
            id="risk-response"
            value={form.riskResponse}
            onChange={(event) => updateField('riskResponse', event.target.value)}
            required
          />
        </Field>
      </FormSection>

      <FormSection title="Controls and links">
        <Field label="Linked controls" htmlFor="linked-controls" span={2}>
          <SelectInput
            id="linked-controls"
            options={controlsOptions}
            placeholder="Select control"
            value={form.linkedControls}
            onChange={(event) => updateField('linkedControls', event.target.value)}
          />
        </Field>
        <Field label="Control design effectiveness" htmlFor="control-design" required>
          <TextInput
            id="control-design"
            value={form.controlDesignEffectiveness}
            onChange={(event) => updateField('controlDesignEffectiveness', event.target.value)}
            required
          />
        </Field>
        <Field label="Control operating effectiveness" htmlFor="control-operating" required>
          <TextInput
            id="control-operating"
            value={form.controlOperatingEffectiveness}
            onChange={(event) => updateField('controlOperatingEffectiveness', event.target.value)}
            required
          />
        </Field>
        <Field label="Overall control effectiveness" htmlFor="overall-control" required>
          <TextInput
            id="overall-control"
            value={form.overallControlEffectiveness}
            onChange={(event) => updateField('overallControlEffectiveness', event.target.value)}
            required
          />
        </Field>
        <Field label="Action required">
          <ToggleField
            label={form.actionRequired ? 'Yes' : 'No'}
            checked={form.actionRequired}
            onChange={(value) => updateField('actionRequired', value)}
          />
        </Field>
        <Field label="Linked action" htmlFor="linked-action">
          <SelectInput
            id="linked-action"
            options={linkedActionOptions}
            placeholder="Select action"
            value={form.linkedAction}
            onChange={(event) => updateField('linkedAction', event.target.value)}
          />
        </Field>
        <Field label="Linked KRIs" htmlFor="linked-kris">
          <SelectInput
            id="linked-kris"
            options={linkedKriOptions}
            placeholder="Select KRI"
            value={form.linkedKris}
            onChange={(event) => updateField('linkedKris', event.target.value)}
          />
        </Field>
        <Field label="Linked OLTS events" htmlFor="linked-olts">
          <SelectInput
            id="linked-olts"
            options={linkedOltsEventOptions}
            placeholder="Select OLTS event"
            value={form.linkedOltsEvents}
            onChange={(event) => updateField('linkedOltsEvents', event.target.value)}
          />
        </Field>
        <Field label="Linked issues / findings" htmlFor="linked-findings">
          <TextInput
            id="linked-findings"
            value={form.linkedIssuesFindings}
            onChange={(event) => updateField('linkedIssuesFindings', event.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection title="Review">
        <Field label="Business review status" htmlFor="business-review-status" required>
          <TextInput
            id="business-review-status"
            value={form.businessReviewStatus}
            onChange={(event) => updateField('businessReviewStatus', event.target.value)}
            required
          />
        </Field>
        <Field label="Risk review verification" htmlFor="risk-review-verification" required>
          <TextInput
            id="risk-review-verification"
            value={form.riskReviewVerification}
            onChange={(event) => updateField('riskReviewVerification', event.target.value)}
            required
          />
        </Field>
        <Field label="Date of last review" htmlFor="date-last-review" required>
          <TextInput
            id="date-last-review"
            type="date"
            value={form.dateOfLastReview}
            onChange={(event) => updateField('dateOfLastReview', event.target.value)}
            required
          />
        </Field>
        <Field label="Next review date" htmlFor="next-review-date" required>
          <TextInput
            id="next-review-date"
            type="date"
            value={form.nextReviewDate}
            onChange={(event) => updateField('nextReviewDate', event.target.value)}
            required
          />
        </Field>
        <Field label="Risk review comment" htmlFor="risk-review-comment" span={3}>
          <TextArea
            id="risk-review-comment"
            value={form.riskReviewComment}
            onChange={(event) => updateField('riskReviewComment', event.target.value)}
          />
        </Field>
      </FormSection>

      {(submitError || isSubmitting) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Saving self assessment...
            </span>
          ) : (
            submitError
          )}
        </div>
      )}
    </FormDrawer>
  );
}
