import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { passwordValidation } from "../../lib/adminModel";
import { Field, SectionTitle } from "./EditorControls";

export function PasswordSettings({ email, runAction, busy }: { email: string; busy: boolean; runAction: (saving: string, success: string, action: () => Promise<void>) => Promise<void> }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    const validation = passwordValidation(current, next, confirmation);
    setError(validation);
    if (validation) return;
    void runAction("Updating your password…", "Your password has been changed.", async () => {
      if (!supabase || !email) throw new Error("Sign in again before changing your password.");
      const verified = await supabase.auth.signInWithPassword({ email, password: current });
      if (verified.error) throw new Error("Your current password could not be verified. Please try again.");
      const result = await supabase.auth.updateUser({ password: next });
      if (result.error) throw result.error;
      setCurrent(""); setNext(""); setConfirmation("");
    });
  };
  return <section className="admin-panel max-w-xl"><SectionTitle title="Account & password">Change the password for your signed-in account.</SectionTitle><p className="mb-6 break-all text-sm text-cyan-200">{email}</p>
    <form onSubmit={changePassword}><fieldset disabled={busy} className="grid gap-5">
      <Field label="Current password" type="password" autoComplete="current-password" value={current} onChange={setCurrent} />
      <Field label="New password" type="password" autoComplete="new-password" value={next} onChange={setNext} />
      <p className="-mt-3 text-xs text-zinc-400">At least 8 characters. Your account’s password rules also apply.</p>
      <Field label="Confirm new password" type="password" autoComplete="new-password" value={confirmation} onChange={setConfirmation} />
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button className="admin-button" disabled={busy}>{busy ? "Updating…" : "Change password"}</button>
    </fieldset></form>
  </section>;
}
