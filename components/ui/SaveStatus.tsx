export function SaveStatus({ isSaving, isSaved }: { isSaving: boolean; isSaved: boolean }) {
  if (isSaving) {
    return <span className="text-xs font-medium text-neutral-500">Saving...</span>;
  }

  if (isSaved) {
    return <span className="text-xs font-medium text-emerald-600">Saved</span>;
  }

  return <span className="text-xs font-medium text-neutral-400">Unsaved</span>;
}
