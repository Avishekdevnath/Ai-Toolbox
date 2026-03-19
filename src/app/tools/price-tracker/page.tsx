'use client';

import ProductPriceTrackerTool from '@/components/tools/ProductPriceTrackerTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function PriceTrackerPage() {
  return (
    <ToolPageLayout toolId="price-tracker" toolName="Price Tracker">
      <ProductPriceTrackerTool />
    </ToolPageLayout>
  );
}
