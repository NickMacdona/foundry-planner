import { useDraggable } from '@dnd-kit/core'
import { ArrowRight, Circle, Square, Type } from 'lucide-react'
import type { AnnotationType } from '../types'
import type { ReactNode } from 'react'
import { AnnotationColorPicker } from './AnnotationColorPicker'
import { ExportImportBar } from './ExportImportBar'
import { LabelSizeSlider } from './LabelSizeSlider'
import { useAppStore } from '../store/useAppStore'

type Props = {
  selectedAnnotationId: string | null
}

export function BottomToolbar({ selectedAnnotationId }: Props) {
  const labelSize = useAppStore((s) => s.labelSize)
  const setLabelSize = useAppStore((s) => s.setLabelSize)

  return (
    <div className="h-full border-t border-slate-700 bg-slate-900/80 flex items-center gap-3 px-4">
      <span className="text-sm text-slate-400 pr-2 border-r border-slate-700">
        Annotations
      </span>
      <ToolTile type="arrow" label="Arrow" icon={<ArrowRight size={18} />} />
      <ToolTile type="box" label="Box" icon={<Square size={18} />} />
      <ToolTile type="circle" label="Circle" icon={<Circle size={18} />} />
      <ToolTile type="text" label="Text" icon={<Type size={18} />} />

      <div className="ml-4 pl-4 border-l border-slate-700">
        <AnnotationColorPicker selectedId={selectedAnnotationId} />
      </div>

      <div className="ml-4 pl-4 border-l border-slate-700">
        <LabelSizeSlider value={labelSize} onChange={setLabelSize} />
      </div>

      <div className="ml-auto pl-4 border-l border-slate-700">
        <ExportImportBar />
      </div>
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
