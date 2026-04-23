import { useDraggable } from '@dnd-kit/core'
import { ArrowRight, Circle, Square, Type } from 'lucide-react'
import type { AnnotationType } from '../types'
import type { ReactNode } from 'react'

export function BottomToolbar() {
  return (
    <div className="h-full border-t border-slate-700 bg-slate-900/80 flex items-center gap-3 px-4">
      <span className="text-sm text-slate-400 pr-2 border-r border-slate-700">
        Annotations
      </span>
      <ToolTile type="arrow" label="Arrow" icon={<ArrowRight size={18} />} />
      <ToolTile type="box" label="Box" icon={<Square size={18} />} />
      <ToolTile type="circle" label="Circle" icon={<Circle size={18} />} />
      <ToolTile type="text" label="Text" icon={<Type size={18} />} />
      <span className="ml-auto text-xs text-slate-500">
        Drag onto map · Click to select · Delete to remove · Double-click text to edit
      </span>
    </div>
  )
}

function ToolTile({
  type,
  label,
  icon,
}: {
  type: AnnotationType
  label: string
  icon: ReactNode
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tool-${type}`,
    data: { kind: 'new-annotation', annotationType: type },
  })
  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={
        'flex items-center gap-2 px-3 py-2 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm cursor-grab active:cursor-grabbing ' +
        (isDragging ? 'opacity-40' : '')
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
