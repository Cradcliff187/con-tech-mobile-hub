import { useEffect, useCallback } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface UseTaskHierarchyKeyboardShortcutsProps {
  onAddTask: () => void;
  onAddCategory: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  selectedTaskId?: string;
  onEditTask?: (taskId: string) => void;
  onDuplicateTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  disabled?: boolean;
}

export const useTaskHierarchyKeyboardShortcuts = ({
  onAddTask,
  onAddCategory,
  onUndo,
  onRedo,
  selectedTaskId,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  disabled = false
}: UseTaskHierarchyKeyboardShortcutsProps) => {
  
  const shortcuts = [
    {
      key: 'n',
      ctrlKey: true,
      description: 'Add new task',
      action: onAddTask
    },
    {
      key: 'n',
      ctrlKey: true,
      shiftKey: true,
      description: 'Add new category',
      action: onAddCategory
    },
    {
      key: 'z',
      ctrlKey: true,
      description: 'Undo last action',
      action: onUndo
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      description: 'Redo last action',
      action: onRedo
    },
    {
      key: 'e',
      ctrlKey: true,
      description: 'Edit selected task',
      action: () => selectedTaskId && onEditTask?.(selectedTaskId)
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Duplicate selected task',
      action: () => selectedTaskId && onDuplicateTask?.(selectedTaskId)
    },
    {
      key: 'Delete',
      description: 'Delete selected task',
      action: () => selectedTaskId && onDeleteTask?.(selectedTaskId)
    }
  ];

  useKeyboardShortcuts(shortcuts, disabled);

  return {
    shortcuts: shortcuts.map(({ action, ...shortcut }) => shortcut)
  };
};