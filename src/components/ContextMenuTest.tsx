import React from 'react';
import { ContextMenu, ContextMenuItem } from './ui/ContextMenu';

export const ContextMenuTest: React.FC = () => {
  const menuItems: ContextMenuItem[] = [
    {
      id: 'test1',
      label: 'Test Action 1',
      onClick: () => alert('Test 1 clicked!')
    },
    {
      id: 'test2',
      label: 'Test Action 2',
      onClick: () => alert('Test 2 clicked!'),
      danger: true
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Context Menu Test</h1>
      <p className="mb-4 text-slate-700 dark:text-slate-300">Right-click on the box below:</p>
      
      <ContextMenu items={menuItems}>
        <div className="w-64 h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg cursor-pointer">
          Right-click me!
        </div>
      </ContextMenu>
    </div>
  );
};
