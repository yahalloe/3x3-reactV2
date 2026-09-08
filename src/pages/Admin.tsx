import { animeImportFields } from "../lib/jikan";
import { type FormEvent, useEffect, useState } from "react";
import { type Anime, type Collection, useContent } from "../content/ContentProvider";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

import { JikanAnimePicker } from "../components/JikanAnimePicker";

type AnimeForm = Omit<Anime, "editorNote" | "collectionSlug"> & { editorNote: string };
const blankAnime = (collectionId = ""): AnimeForm => ({ id: crypto.randomUUID(), collectionId, slug: "", title: "", cardImageUrl: "", detailImageUrl: "", synopsis: "", editorNote: "", streamingProviders: [], sortOrder: 0, isPublished: true });

export function Admin() {
  const { anime, collections, settings, refresh } = useContent();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<AnimeForm>(() => blankAnime());
  const [settingsForm, setSettingsForm] = useState(settings);
  const [collectionForm, setCollectionForm] = useState<Collection | null>(null);

  useEffect(() => setSettingsForm(settings), [settings]);
  useEffect(() => { if (!collectionForm && collections[0]) setCollectionForm(collections[0]); }, [collectionForm, collections]);
  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    const client = supabase;
    const verify = async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!user) { setAuthorized(false); setChecking(false); return; }
      const { data } = await client.from("content_admins").select("user_id").eq("user_id", user.id).maybeSingle();
      setAuthorized(Boolean(data)); setChecking(false);
    };
    void verify();
  }, []);

  if (!isSupabaseConfigured) return <AdminShell><p>Configure <code>.env.local</code> from <code>.env.example</code>, then restart Vite.</p></AdminShell>;
  if (checking) return <AdminShell><p>Checking editor access…</p></AdminShell>;

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setMessage("Signing in…");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { setMessage(error?.message ?? "Unable to sign in."); return; }
    const { data: admin } = await supabase.from("content_admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
    setAuthorized(Boolean(admin)); setMessage(admin ? "Signed in." : "This account is signed in but has not been granted editor access.");
  };

  if (!authorized) return <AdminShell><h1 className="text-3xl font-bold">Content editor</h1><p className="mt-2 text-zinc-400">Sign in with your Supabase Auth administrator account.</p><form onSubmit={signIn} className="mt-8 grid max-w-sm gap-3"><input className="admin-input" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required /><input className="admin-input" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="admin-button">Sign in</button></form>{message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}</AdminShell>;

  const selectAnime = (entry: Anime) => setForm({ ...entry, editorNote: String(entry.editorNote) });
  const saveAnime = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    const { error } = await supabase.from("anime").upsert({ id: form.id, collection_id: form.collectionId, slug: form.slug, title: form.title, card_image_url: form.cardImageUrl, detail_image_url: form.detailImageUrl || form.cardImageUrl, synopsis: form.synopsis, editor_note: form.editorNote, streaming_providers: form.streamingProviders, sort_order: Number(form.sortOrder), is_published: form.isPublished });
    setMessage(error ? error.message : "Anime saved."); if (!error) { await refresh(); }
  };
  const saveSettings = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    const { error } = await supabase.from("site_settings").upsert({ id: true, home_title: settingsForm.homeTitle, archive_label: settingsForm.archiveLabel, about_title: settingsForm.aboutTitle, about_body: settingsForm.aboutBody, footer_text: settingsForm.footerText });
    setMessage(error ? error.message : "Site settings saved."); if (!error) await refresh();
  };
  const saveCollection = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase || !collectionForm) return;
    const { error } = await supabase.from("collections").upsert({ id: collectionForm.id, slug: collectionForm.slug, title: collectionForm.title, eyebrow: collectionForm.eyebrow, description: collectionForm.description, cover_image_url: collectionForm.coverImageUrl, sort_order: Number(collectionForm.sortOrder), is_published: collectionForm.isPublished });
    setMessage(error ? error.message : "Collection saved."); if (!error) await refresh();
  };
  const deleteAnime = async () => {
    if (!supabase || !window.confirm(`Delete ${form.title || "this anime"}?`)) return;
    const { error } = await supabase.from("anime").delete().eq("id", form.id);
    setMessage(error ? error.message : "Anime deleted."); if (!error) { setForm(blankAnime(collections[0]?.id)); await refresh(); }
  };
  const toggleProvider = (provider: "netflix" | "crunchyroll") => setForm((current) => ({ ...current, streamingProviders: current.streamingProviders.includes(provider) ? current.streamingProviders.filter((item) => item !== provider) : [...current.streamingProviders, provider] }));

  return <AdminShell><div className="flex items-center justify-between gap-4"><div><p className="section-label">Private editor</p><h1 className="mt-2 text-3xl font-bold">Manage content</h1></div><button className="text-sm text-zinc-400 hover:text-white" onClick={() => { void supabase?.auth.signOut(); setAuthorized(false); }}>Sign out</button></div>{message && <p className="mt-5 rounded-lg bg-cyan-300/10 px-4 py-3 text-sm text-cyan-200">{message}</p>}<section className="admin-panel mt-8"><h2>Site copy</h2><form onSubmit={saveSettings} className="mt-4 grid gap-3"><TextInput label="Home title" value={settingsForm.homeTitle} onChange={(value) => setSettingsForm({ ...settingsForm, homeTitle: value })}/><TextInput label="Archive label" value={settingsForm.archiveLabel} onChange={(value) => setSettingsForm({ ...settingsForm, archiveLabel: value })}/><TextInput label="About title" value={settingsForm.aboutTitle} onChange={(value) => setSettingsForm({ ...settingsForm, aboutTitle: value })}/><TextArea label="About body" value={settingsForm.aboutBody} onChange={(value) => setSettingsForm({ ...settingsForm, aboutBody: value })}/><TextInput label="Footer text" value={settingsForm.footerText} onChange={(value) => setSettingsForm({ ...settingsForm, footerText: value })}/><button className="admin-button">Save site copy</button></form></section>{collectionForm && <section className="admin-panel mt-6"><div className="flex items-center justify-between"><h2>Collections</h2><button className="text-sm text-cyan-300" onClick={() => setCollectionForm({ id: crypto.randomUUID(), slug: "", title: "", eyebrow: "Genre collection", description: "", coverImageUrl: "", sortOrder: collections.length, isPublished: true })}>New collection</button></div><select className="admin-input mt-4" value={collectionForm.id} onChange={(event) => setCollectionForm(collections.find((collection) => collection.id === event.target.value) ?? collectionForm)}>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.title}</option>)}</select><form onSubmit={saveCollection} className="mt-4 grid gap-3"><TextInput label="Slug" value={collectionForm.slug} onChange={(value) => setCollectionForm({ ...collectionForm, slug: value })}/><TextInput label="Title" value={collectionForm.title} onChange={(value) => setCollectionForm({ ...collectionForm, title: value })}/><TextInput label="Eyebrow" value={collectionForm.eyebrow} onChange={(value) => setCollectionForm({ ...collectionForm, eyebrow: value })}/><TextArea label="Description" value={collectionForm.description} onChange={(value) => setCollectionForm({ ...collectionForm, description: value })}/><TextInput label="Cover image URL" value={collectionForm.coverImageUrl} onChange={(value) => setCollectionForm({ ...collectionForm, coverImageUrl: value })}/><TextInput label="Sort order" type="number" value={String(collectionForm.sortOrder)} onChange={(value) => setCollectionForm({ ...collectionForm, sortOrder: Number(value) })}/><label className="text-sm"><input type="checkbox" checked={collectionForm.isPublished} onChange={(event) => setCollectionForm({ ...collectionForm, isPublished: event.target.checked })} /> Published</label><button className="admin-button">Save collection</button></form></section>}<section className="admin-panel mt-6"><div className="flex items-center justify-between"><h2>Anime</h2><button className="text-sm text-cyan-300" onClick={() => setForm(blankAnime(collections[0]?.id))}>New anime</button></div><div className="mt-4 flex flex-wrap gap-2">{anime.map((entry) => <button key={entry.id} onClick={() => selectAnime(entry)} className="rounded-full bg-white/8 px-3 py-1.5 text-xs hover:bg-white/15">{entry.title}</button>)}</div><form onSubmit={saveAnime} className="mt-6 grid gap-3"><JikanAnimePicker key={form.id} onSelect={(entry) => setForm((current) => ({ ...current, collectionId: current.collectionId || collections[0]?.id || "", ...animeImportFields(entry) }))} /><TextInput label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })}/><TextInput label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })}/><label className="text-sm text-zinc-300">Collection<select className="admin-input mt-1" value={form.collectionId} onChange={(event) => setForm({ ...form, collectionId: event.target.value })}>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.title}</option>)}</select></label><TextInput label="Card image URL" value={form.cardImageUrl} onChange={(value) => setForm({ ...form, cardImageUrl: value })}/><TextInput label="Detail image URL" value={form.detailImageUrl} onChange={(value) => setForm({ ...form, detailImageUrl: value })}/><TextArea label="Synopsis" value={form.synopsis} onChange={(value) => setForm({ ...form, synopsis: value })}/><TextArea label="Editor note" value={form.editorNote} onChange={(value) => setForm({ ...form, editorNote: value })}/><TextInput label="Sort order" type="number" value={String(form.sortOrder)} onChange={(value) => setForm({ ...form, sortOrder: Number(value) })}/><div className="flex gap-5 text-sm">{(["netflix", "crunchyroll"] as const).map((provider) => <label key={provider}><input type="checkbox" checked={form.streamingProviders.includes(provider)} onChange={() => toggleProvider(provider)} /> {provider}</label>)}<label><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /> Published</label></div><div className="flex gap-3"><button className="admin-button">Save anime</button><button type="button" className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-300" onClick={() => { void deleteAnime(); }}>Delete</button></div></form></section></AdminShell>;
}

function AdminShell({ children }: { children: React.ReactNode }) { return <main className="page-surface min-h-screen px-5 py-12 text-zinc-100 sm:px-8"><div className="mx-auto max-w-3xl">{children}</div></main>; }
function TextInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="text-sm text-zinc-300">{label}<input type={type} className="admin-input mt-1" value={value} onChange={(event) => onChange(event.target.value)} required /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-sm text-zinc-300">{label}<textarea className="admin-input mt-1 min-h-28" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
