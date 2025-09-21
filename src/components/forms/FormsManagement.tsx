'use client';

import { useState } from 'react';
import FormsList from '@/components/forms/FormsList';
import BulkOperations from '@/components/forms/BulkOperations';
import { FormItem } from '@/components/forms/BulkOperations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FormsManagement() {
  const [activeTab, setActiveTab] = useState('list');
  const [forms, setForms] = useState<FormItem[]>([]);

  const handleBulkDelete = async (formIds: string[]) => {
    // Implement bulk delete
    console.log('Bulk delete:', formIds);
  };

  const handleBulkPublish = async (formIds: string[]) => {
    // Implement bulk publish
    console.log('Bulk publish:', formIds);
  };

  const handleBulkUnpublish = async (formIds: string[]) => {
    // Implement bulk unpublish
    console.log('Bulk unpublish:', formIds);
  };

  const handleBulkArchive = async (formIds: string[]) => {
    // Implement bulk archive
    console.log('Bulk archive:', formIds);
  };

  const handleBulkExport = async (formIds: string[], format: 'json' | 'csv') => {
    // Implement bulk export
    console.log('Bulk export:', formIds, format);
  };

  const handleBulkDuplicate = async (formIds: string[]) => {
    // Implement bulk duplicate
    console.log('Bulk duplicate:', formIds);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">Forms List</TabsTrigger>
        <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-6">
        <FormsList />
      </TabsContent>

      <TabsContent value="bulk" className="space-y-6">
        <BulkOperations
          forms={forms}
          onBulkDelete={handleBulkDelete}
          onBulkPublish={handleBulkPublish}
          onBulkUnpublish={handleBulkUnpublish}
          onBulkArchive={handleBulkArchive}
          onBulkExport={handleBulkExport}
          onBulkDuplicate={handleBulkDuplicate}
        />
      </TabsContent>
    </Tabs>
  );
}
