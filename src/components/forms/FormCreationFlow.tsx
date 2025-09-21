'use client';

import FormBuilder from '@/components/forms/FormBuilder';

export default function FormCreationFlow() {
  return (
    <div className="space-y-6">
      <FormBuilder
        onSave={() => {
          console.log('Form saved successfully');
        }}
      />
    </div>
  );
}
