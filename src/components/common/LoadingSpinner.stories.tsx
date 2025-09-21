import type { Meta, StoryObj } from '@storybook/react';
import LoadingSpinner from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Common/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    text: {
      control: { type: 'text' },
    },
    className: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithText: Story = {
  args: {
    text: 'Loading data...',
  },
};

export const CustomStyling: Story = {
  args: {
    className: 'bg-gray-100 p-4 rounded-lg',
    text: 'Custom styled spinner',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Small</h3>
        <LoadingSpinner size="sm" text="Small spinner" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Medium (Default)</h3>
        <LoadingSpinner text="Medium spinner" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Large</h3>
        <LoadingSpinner size="lg" text="Large spinner" />
      </div>
    </div>
  ),
}; 