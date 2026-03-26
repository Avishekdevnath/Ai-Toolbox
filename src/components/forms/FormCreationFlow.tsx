'use client';

import FormBuilder from '@/components/forms/FormBuilder';

export default function FormCreationFlow() {
  return (
    <div className="form-luxe form-luxe-panel space-y-6">
      <FormBuilder
        onSave={() => {
          console.log('Form saved successfully');
        }}
      />
    </div>
  );
}
