'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Users, 
  DollarSign, 
  Percent, 
  Sparkles,
  Copy,
  Share2,
  TrendingUp
} from 'lucide-react';

interface TipCalculation {
  billAmount: number;
  tipPercentage: number;
  tipAmount: number;
  totalAmount: number;
  perPerson: number;
  taxAmount: number;
  subtotal: number;
}

interface TipSuggestion {
  percentage: number;
  reason: string;
  quality: 'poor' | 'average' | 'excellent';
}

export default function TipCalculatorTool() {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercentage, setTipPercentage] = useState(18);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [taxRate, setTaxRate] = useState(8.5);
  const [includeTax, setIncludeTax] = useState(true);
  const [serviceQuality, setServiceQuality] = useState<'poor' | 'average' | 'excellent'>('average');
  const [calculation, setCalculation] = useState<TipCalculation | null>(null);
  const [tipSuggestions, setTipSuggestions] = useState<TipSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate tip suggestions based on service quality
  useEffect(() => {
    const suggestions: TipSuggestion[] = [
      {
        percentage: serviceQuality === 'poor' ? 10 : serviceQuality === 'average' ? 18 : 25,
        reason: serviceQuality === 'poor' ? 'Below average service' : 
                serviceQuality === 'average' ? 'Standard service' : 'Exceptional service',
        quality: serviceQuality
      },
      {
        percentage: serviceQuality === 'poor' ? 15 : serviceQuality === 'average' ? 20 : 30,
        reason: serviceQuality === 'poor' ? 'Fair service' : 
                serviceQuality === 'average' ? 'Good service' : 'Outstanding service',
        quality: serviceQuality === 'poor' ? 'average' : serviceQuality === 'average' ? 'excellent' : 'excellent'
      },
      {
        percentage: serviceQuality === 'poor' ? 20 : serviceQuality === 'average' ? 22 : 35,
        reason: 'Generous tip for exceptional experience',
        quality: 'excellent'
      }
    ];
    setTipSuggestions(suggestions);
  }, [serviceQuality]);

  // Calculate tip when inputs change
  useEffect(() => {
    if (billAmount && parseFloat(billAmount) > 0) {
      calculateTip();
    }
  }, [billAmount, tipPercentage, numberOfPeople, taxRate, includeTax]);

  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const tip = (bill * tipPercentage) / 100;
    const tax = includeTax ? (bill * taxRate) / 100 : 0;
    const subtotal = bill + tax;
    const total = subtotal + tip;
    const perPerson = total / numberOfPeople;

    setCalculation({
      billAmount: bill,
      tipPercentage,
      tipAmount: tip,
      totalAmount: total,
      perPerson,
      taxAmount: tax,
      subtotal
    });

    // Track successful tip calculation
    try {
      fetch('/api/tools/tip-calculator/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageType: 'generate' })
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  };

  const handleTipSuggestion = (percentage: number) => {
    setTipPercentage(percentage);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const shareCalculation = () => {
    if (calculation) {
      const text = `Bill: $${calculation.billAmount.toFixed(2)}\nTip (${calculation.tipPercentage}%): $${calculation.tipAmount.toFixed(2)}\nTotal: $${calculation.totalAmount.toFixed(2)}\nPer Person: $${calculation.perPerson.toFixed(2)}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Tip Calculation',
          text: text
        });
      } else {
        copyToClipboard(text);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'poor': return 'bg-red-100 text-red-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'excellent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Tip Calculator</h1>
        <p className="text-gray-600">
          Calculate tips with smart suggestions, bill splitting, and tax calculations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Bill Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="billAmount">Bill Amount ($)</Label>
              <Input
                id="billAmount"
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-4">
              <Label>Service Quality</Label>
              <div className="flex gap-2">
                {(['poor', 'average', 'excellent'] as const).map((quality) => (
                  <Button
                    key={quality}
                    variant={serviceQuality === quality ? "default" : "outline"}
                    onClick={() => setServiceQuality(quality)}
                    className="flex-1 capitalize"
                  >
                    {quality}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Tip Percentage: {tipPercentage}%</Label>
                <Badge variant="outline">{tipPercentage}%</Badge>
              </div>
              <Slider
                value={[tipPercentage]}
                onValueChange={(value) => setTipPercentage(value[0])}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="people">Number of People</Label>
              <Input
                id="people"
                type="number"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeTax"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="includeTax">Include Tax</Label>
              </div>
              
              {includeTax && (
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="20"
                    step="0.1"
                  />
                </div>
              )}
            </div>

            <Button 
              onClick={() => setShowSuggestions(!showSuggestions)}
              variant="outline"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {showSuggestions ? 'Hide' : 'Show'} AI Suggestions
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {calculation && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Calculation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculation.tipAmount)}
                      </div>
                      <div className="text-sm text-blue-600">Tip Amount</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(calculation.totalAmount)}
                      </div>
                      <div className="text-sm text-green-600">Total Amount</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bill Amount:</span>
                      <span>{formatCurrency(calculation.billAmount)}</span>
                    </div>
                    {includeTax && (
                      <div className="flex justify-between">
                        <span>Tax ({taxRate}%):</span>
                        <span>{formatCurrency(calculation.taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tip ({tipPercentage}%):</span>
                      <span>{formatCurrency(calculation.tipAmount)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculation.totalAmount)}</span>
                    </div>
                  </div>

                  {numberOfPeople > 1 && (
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {formatCurrency(calculation.perPerson)}
                      </div>
                      <div className="text-sm text-purple-600">Per Person ({numberOfPeople} people)</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => copyToClipboard(`Total: ${formatCurrency(calculation.totalAmount)}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Total
                    </Button>
                    <Button 
                      onClick={shareCalculation}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              {showSuggestions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tipSuggestions.map((suggestion, index) => (
                        <div 
                          key={index} 
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleTipSuggestion(suggestion.percentage)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{suggestion.percentage}%</span>
                              <Badge className={getQualityColor(suggestion.quality)}>
                                {suggestion.quality}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-600">
                              {formatCurrency((calculation.billAmount * suggestion.percentage) / 100)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{suggestion.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tips and Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tipping Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="restaurants" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="travel">Travel</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurants" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">Poor Service (10-15%)</h4>
                  <p className="text-sm text-red-700">Slow service, mistakes, rude staff</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">Average Service (15-20%)</h4>
                  <p className="text-sm text-yellow-700">Standard service, no issues</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Excellent Service (20-25%)</h4>
                  <p className="text-sm text-green-700">Outstanding service, attentive staff</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Hair Salons & Spas (15-20%)</h4>
                  <p className="text-sm text-blue-700">Standard tipping for personal services</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Taxi & Rideshare (10-15%)</h4>
                  <p className="text-sm text-purple-700">For good service and clean vehicles</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Food Delivery (15-20%)</h4>
                  <p className="text-sm text-orange-700">Higher for long distances or bad weather</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-800">Package Delivery (5-10%)</h4>
                  <p className="text-sm text-indigo-700">For exceptional service or heavy items</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="travel" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-teal-50 rounded-lg">
                  <h4 className="font-semibold text-teal-800">Hotel Staff (2-5$/day)</h4>
                  <p className="text-sm text-teal-700">Housekeeping, bellhops, concierge</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-pink-800">Tour Guides (10-20%)</h4>
                  <p className="text-sm text-pink-700">For guided tours and experiences</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 