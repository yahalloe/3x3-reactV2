import { useEffect, useRef } from "react";

export function SignOutDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); if (trigger instanceof HTMLElement) trigger.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby="sign-out-title" aria-describedby="sign-out-description" onCancel={(event) => { event.preventDefault(); onCancel(); }} className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/15 bg-zinc-900 p-6 text-zinc-100 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
    <h2 id="sign-out-title" className="text-xl font-bold">Sign out of the editor?</h2>
    <p id="sign-out-description" className="mt-3 text-sm leading-6 text-zinc-400">Any unsaved changes will be lost. You can stay here to finish editing.</p>
    <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" autoFocus className="editor-secondary-button" onClick={onCancel}>Keep editing</button><button type="button" className="admin-button" onClick={onConfirm}>Sign out</button></div>
  </dialog>;
}
