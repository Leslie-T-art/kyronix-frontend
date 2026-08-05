import React from 'react';
import { DetailDrawer } from './DetailDrawer';
import { Button } from '../ui/Button';

interface FormDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  formId: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

/** Wide right-sliding drawer used for every capture form. */
export function FormDrawer({
  open,
  title,
  subtitle,
  formId,
  submitLabel = 'Save',
  onClose,
  onSubmit,
  children
}: FormDrawerProps) {
  return (
    <DetailDrawer
      open={open}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      width="xl"
      footer={
      <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form={formId}>
            {submitLabel}
          </Button>
        </div>
      }>
      
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </DetailDrawer>);

}