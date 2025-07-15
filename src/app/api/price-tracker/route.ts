import { NextRequest, NextResponse } from 'next/server';
import { getProductInfoAndPrices, generatePriceHistory } from '@/lib/priceAPIs';

export async function POST(request: NextRequest) {
  try {
    const { productName, timeRange = '7' } = await request.json();

    if (!productName || typeof productName !== 'string') {
      return NextResponse.json(
        { error: 'Product name is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`Processing price tracker request for: ${productName}`);

    // Get product info and prices using the simple estimation system
    const productInfo = await getProductInfoAndPrices(productName);

    // Generate price history based on time range
    const days = parseInt(timeRange);
    const basePrice = productInfo.averagePrice || productInfo.lowestPrice || 500;
    const priceHistory = generatePriceHistory(days, basePrice);

    // Generate date labels for the chart
    const dateLabels = priceHistory.map(item => {
      const date = new Date(item.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays <= 7) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (diffDays <= 30) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (diffDays <= 180) return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    const response = {
      success: true,
      product: productInfo,
      priceHistory,
      dateLabels,
      timeRange: days,
      timestamp: new Date().toISOString()
    };

    console.log(`Successfully processed price tracker request for: ${productName}`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in price tracker API:', error);
    return NextResponse.json(
      { error: 'Failed to process price tracker request' },
      { status: 500 }
    );
  }
} 