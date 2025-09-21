interface StepHeaderProps {
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100'
};

const textColorClasses = {
  blue: 'text-blue-800 dark:text-blue-200',
  green: 'text-green-800 dark:text-green-200',
  purple: 'text-purple-800 dark:text-purple-200',
  orange: 'text-orange-800 dark:text-orange-200',
  yellow: 'text-yellow-800 dark:text-yellow-200'
};

export function StepHeader({ title, description, icon, color }: StepHeaderProps) {
  return (
    <div className={`${colorClasses[color]} p-4 rounded-lg mb-6`}>
      <h3 className="text-lg font-medium mb-2">
        {icon} {title}
      </h3>
      <p className={`${textColorClasses[color]} text-sm`}>
        {description}
      </p>
    </div>
  );
} 