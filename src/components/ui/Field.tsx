import React from 'react';
import { cn } from '../../utils/cn';

const CONTROL =
'h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:bg-zinc-50 disabled:text-zinc-500';

export function FormSection({
  title,
  description,
  children




}: {title: string;description?: string;children: React.ReactNode;}) {
  return (
    <section className="rounded-xl border border-zinc-200 p-4">
      <header className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-navy">{title}</h3>
        {description && <p className="mt-0.5 text-[11px] text-zinc-500">{description}</p>}
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>);

}

interface FieldProps {
  label: string;
  htmlFor?: string;
  span?: 1 | 2 | 3;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, span = 1, hint, required, children }: FieldProps) {
  return (
    <div
      className={cn(
        span === 2 && 'sm:col-span-2',
        span === 3 && 'sm:col-span-2 lg:col-span-3'
      )}>
      
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-zinc-600">
        {label}
        {required && <span className="ml-0.5 text-red-700">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-zinc-400">{hint}</p>}
    </div>);

}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(CONTROL, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={cn(CONTROL, 'h-auto py-2 leading-relaxed', props.className)} />);


}

export function SelectInput({
  options,
  placeholder = 'Select…',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {options: string[];placeholder?: string;}) {
  return (
    <select {...props} className={cn(CONTROL, props.className)}>
      <option value="">{placeholder}</option>
      {options.map((option) =>
      <option key={option} value={option}>
          {option}
        </option>
      )}
    </select>);

}

export function ReadOnlyValue({ value }: {value: string;}) {
  return (
    <div className="tabular flex h-10 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-navy">
      {value}
    </div>);

}

export function ToggleField({
  label,
  checked,
  onChange




}: {label: string;checked: boolean;onChange: (value: boolean) => void;}) {
  return (
    <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 text-navy focus:ring-navy" />
      
      {label}
    </label>);

}