import { getCurrencies, convertCurrency, formatCurrency } from '@/lib/currencyConverter';

export type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed' | 'currency';

export interface Unit {
  key: string;
  name: string;
  factor: number;
}

const conversions = {
  length: {
    name: 'Length',
    units: [
      { key: 'meter', name: 'Meter', factor: 1 },
      { key: 'kilometer', name: 'Kilometer', factor: 1000 },
      { key: 'centimeter', name: 'Centimeter', factor: 0.01 },
      { key: 'millimeter', name: 'Millimeter', factor: 0.001 },
      { key: 'inch', name: 'Inch', factor: 0.0254 },
      { key: 'foot', name: 'Foot', factor: 0.3048 },
      { key: 'yard', name: 'Yard', factor: 0.9144 },
      { key: 'mile', name: 'Mile', factor: 1609.34 }
    ]
  },
  weight: {
    name: 'Weight',
    units: [
      { key: 'kilogram', name: 'Kilogram', factor: 1 },
      { key: 'gram', name: 'Gram', factor: 0.001 },
      { key: 'pound', name: 'Pound', factor: 0.453592 },
      { key: 'ounce', name: 'Ounce', factor: 0.0283495 },
      { key: 'ton', name: 'Ton', factor: 1000 },
      { key: 'stone', name: 'Stone', factor: 6.35029 }
    ]
  },
  temperature: {
    name: 'Temperature',
    units: [
      { key: 'celsius', name: 'Celsius', factor: 1 },
      { key: 'fahrenheit', name: 'Fahrenheit', factor: 1 },
      { key: 'kelvin', name: 'Kelvin', factor: 1 }
    ]
  },
  volume: {
    name: 'Volume',
    units: [
      { key: 'liter', name: 'Liter', factor: 1 },
      { key: 'milliliter', name: 'Milliliter', factor: 0.001 },
      { key: 'gallon', name: 'Gallon (US)', factor: 3.78541 },
      { key: 'quart', name: 'Quart', factor: 0.946353 },
      { key: 'pint', name: 'Pint', factor: 0.473176 },
      { key: 'cup', name: 'Cup', factor: 0.236588 },
      { key: 'fluid_ounce', name: 'Fluid Ounce', factor: 0.0295735 }
    ]
  },
  area: {
    name: 'Area',
    units: [
      { key: 'square_meter', name: 'Square Meter', factor: 1 },
      { key: 'square_kilometer', name: 'Square Kilometer', factor: 1000000 },
      { key: 'square_centimeter', name: 'Square Centimeter', factor: 0.0001 },
      { key: 'square_foot', name: 'Square Foot', factor: 0.092903 },
      { key: 'square_inch', name: 'Square Inch', factor: 0.00064516 },
      { key: 'acre', name: 'Acre', factor: 4046.86 },
      { key: 'hectare', name: 'Hectare', factor: 10000 }
    ]
  },
  speed: {
    name: 'Speed',
    units: [
      { key: 'meter_per_second', name: 'Meter/Second', factor: 1 },
      { key: 'kilometer_per_hour', name: 'Kilometer/Hour', factor: 0.277778 },
      { key: 'mile_per_hour', name: 'Mile/Hour', factor: 0.44704 },
      { key: 'foot_per_second', name: 'Foot/Second', factor: 0.3048 },
      { key: 'knot', name: 'Knot', factor: 0.514444 }
    ]
  },
  currency: {
    name: 'Currency',
    units: getCurrencies().map(currency => ({
      key: currency.code,
      name: `${currency.name} (${currency.code})`,
      factor: 1 // Currency conversion uses real-time rates, not factors
    }))
  }
};

export function getCategories() {
  return Object.keys(conversions) as UnitCategory[];
}

export function getUnitsForCategory(category: UnitCategory): Unit[] {
  return conversions[category].units;
}

export function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  switch (from) {
    case 'fahrenheit':
      celsius = (value - 32) * 5/9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    default:
      celsius = value;
  }
  switch (to) {
    case 'fahrenheit':
      return celsius * 9/5 + 32;
    case 'kelvin':
      return celsius + 273.15;
    default:
      return celsius;
  }
}

export async function convertValue(category: UnitCategory, value: number, from: string, to: string): Promise<number> {
  if (category === 'temperature') {
    return convertTemperature(value, from, to);
  }
  
  if (category === 'currency') {
    return await convertCurrency(value, from, to);
  }
  
  const units = conversions[category].units;
  const fromUnit = units.find(u => u.key === from);
  const toUnit = units.find(u => u.key === to);
  if (!fromUnit || !toUnit) return NaN;
  return (value * fromUnit.factor) / toUnit.factor;
}

// Format result based on category
export function formatResult(value: number, category: UnitCategory, unitKey: string): string {
  if (category === 'currency') {
    return formatCurrency(value, unitKey);
  }
  
  // For other categories, return the value with unit name
  const units = getUnitsForCategory(category);
  const unit = units.find(u => u.key === unitKey);
  const unitName = unit?.name || unitKey;
  
  return `${value.toFixed(6).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')} ${unitName}`;
} 