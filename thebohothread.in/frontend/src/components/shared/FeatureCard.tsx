import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export default function FeatureCard({ icon: Icon, title, description, iconColor = 'text-primary-600', iconBg = 'bg-primary-50 dark:bg-primary-900/20', className }: FeatureCardProps) {
  return (
    <div className={cn('card p-6 hover:shadow-md transition-shadow', className)}>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', iconBg)}>
        <Icon className={cn('w-6 h-6', iconColor)} />
      </div>
      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
