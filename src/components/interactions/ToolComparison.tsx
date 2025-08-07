'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Check, X as XIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  features: string[];
  pros: string[];
  cons: string[];
}

interface ToolComparisonProps {
  tools: Tool[];
  maxTools?: number;
}

export default function ToolComparison({ tools, maxTools = 3 }: ToolComparisonProps) {
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const addTool = (tool: Tool) => {
    if (selectedTools.length >= maxTools) {
      toast({
        title: 'Maximum Tools Reached',
        description: `You can compare up to ${maxTools} tools at a time.`,
        variant: 'destructive'
      });
      return;
    }

    if (selectedTools.find(t => t.id === tool.id)) {
      toast({
        title: 'Tool Already Added',
        description: 'This tool is already in your comparison.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedTools(prev => [...prev, tool]);
    toast({
      title: 'Tool Added',
      description: `${tool.name} has been added to comparison.`,
    });
  };

  const removeTool = (toolId: string) => {
    setSelectedTools(prev => prev.filter(t => t.id !== toolId));
  };

  const clearComparison = () => {
    setSelectedTools([]);
    setShowComparison(false);
  };

  const getComparisonData = () => {
    const allFeatures = new Set<string>();
    const allPros = new Set<string>();
    const allCons = new Set<string>();

    selectedTools.forEach(tool => {
      tool.features.forEach(feature => allFeatures.add(feature));
      tool.pros.forEach(pro => allPros.add(pro));
      tool.cons.forEach(con => allCons.add(con));
    });

    return {
      features: Array.from(allFeatures),
      pros: Array.from(allPros),
      cons: Array.from(allCons)
    };
  };

  if (selectedTools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tool Comparison</span>
            <Badge variant="outline">{selectedTools.length}/{maxTools}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Start Comparing Tools</h3>
            <p className="text-gray-600 mb-4">
              Select up to {maxTools} tools to compare their features and capabilities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.slice(0, 6).map(tool => (
                <Button
                  key={tool.id}
                  variant="outline"
                  onClick={() => addTool(tool)}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="font-medium">{tool.name}</span>
                  <span className="text-xs text-gray-500">{tool.category}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonData = getComparisonData();

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tool Comparison</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{selectedTools.length}/{maxTools}</Badge>
              <Button variant="outline" size="sm" onClick={clearComparison}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTools.map(tool => (
              <Badge key={tool.id} variant="secondary" className="flex items-center space-x-1">
                <span className="text-sm">{tool.icon}</span>
                <span>{tool.name}</span>
                <button
                  onClick={() => removeTool(tool.id)}
                  className="ml-1 hover:text-red-500"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {selectedTools.length < maxTools && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tools
                .filter(tool => !selectedTools.find(t => t.id === tool.id))
                .slice(0, 4)
                .map(tool => (
                  <Button
                    key={tool.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addTool(tool)}
                    className="h-auto p-2 flex flex-col items-center space-y-1"
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <span className="text-xs font-medium">{tool.name}</span>
                  </Button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Feature</th>
                  {selectedTools.map(tool => (
                    <th key={tool.id} className="text-center p-2 border-b">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-lg">{tool.icon}</span>
                        <span className="font-medium">{tool.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Features */}
                <tr>
                  <td className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Features</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-2 border-b">
                      <div className="space-y-1">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <Check className="w-3 h-3 text-green-500 mr-1" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Pros */}
                <tr>
                  <td className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Pros</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-2 border-b">
                      <div className="space-y-1">
                        {tool.pros.map((pro, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <Check className="w-3 h-3 text-green-500 mr-1" />
                            {pro}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Cons */}
                <tr>
                  <td className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Cons</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-2 border-b">
                      <div className="space-y-1">
                        {tool.cons.map((con, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <XIcon className="w-3 h-3 text-red-500 mr-1" />
                            {con}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr>
                  <td className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Description</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-2 border-b">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tool.description}
                      </p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 