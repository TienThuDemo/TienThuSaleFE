import { useState, type ReactNode } from 'react';
import { Pencil, Save, X } from 'lucide-react';

interface Props {
  title: ReactNode;
  icon?: ReactNode;
  canEdit: boolean;
  children: ReactNode;
  editForm: (onSave: () => void, onCancel: () => void) => ReactNode;
}

export default function EditableSection({ title, icon, canEdit, children, editForm }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="glass-card p-5 lg:p-7">
      <div className="flex items-center justify-between mb-2">
        <div className="section-title !mb-0 !pb-2">{icon} {title}</div>
        {canEdit && !editing && (
          <button className="btn-ghost text-[12px]" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5" /> Sửa
          </button>
        )}
      </div>
      {editing ? (
        <div className="animate-fade-in">
          {editForm(
            () => setEditing(false),
            () => setEditing(false)
          )}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#2d3348]">
            <button className="btn-success text-[13px] px-5 py-2.5" onClick={() => setEditing(false)} id="save-section">
              <Save className="w-4 h-4" /> <span>Lưu</span>
            </button>
            <button className="btn-ghost text-[13px]" onClick={() => setEditing(false)}>
              <X className="w-4 h-4" /> Hủy
            </button>
          </div>
        </div>
      ) : children}
    </div>
  );
}
