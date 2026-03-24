'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { navigationItems } from './nav-config';
import { SidebarNavItem } from './SidebarNavItem';

interface Props {
  userRole?: string;
  onClose?: () => void;
}

export function SidebarNav({ userRole, onClose }: Props) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const pathname = usePathname();

  const toggle = (title: string) =>
    setExpanded((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );

  const visible = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(userRole ?? '')
  );

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
      <ul className="space-y-0.5">
        {visible.map((item) => (
          <SidebarNavItem
            key={item.title}
            item={item}
            isActive={pathname === item.href}
            isExpanded={expanded.includes(item.title)}
            activeChild={item.children?.some((c) => pathname === c.href) ?? false}
            onToggle={toggle}
            onClose={onClose}
          />
        ))}
      </ul>
    </nav>
  );
}
