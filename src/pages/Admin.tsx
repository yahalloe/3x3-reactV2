import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { type Anime, type Collection, useContent } from "../content/ContentProvider";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { animeImportFields } from "../lib/jikan";
import { collectionPositions, firstFreePosition, positionIsAvailable } from "../lib/adminModel";
import { JikanAnimePicker } from "../components/JikanAnimePicker";
import { AnimeLibrary, Cover, Field, PositionPicker, SaveToast, SectionTitle, TextArea, type SaveNotice } from "../components/admin/EditorControls";
import { EditorialComments } from "../components/admin/EditorialComments";
import { SignOutDialog } from "../components/admin/SignOutDialog";
import { PasswordSettings } from "../components/admin/PasswordSettings";

type AnimeForm = Omit<Anime, "editorNote" | "collectionSlug">;
type Tab = "anime" | "collections" | "comments" | "site" | "account";
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "anime", label: "Anime", icon: "▦" }, { id: "collections", label: "Collections", icon: "▤" },
  { id: "comments", label: "Comments", icon: "☷" }, { id: "site", label: "Site copy", icon: "Aa" }, { id: "account", label: "Account", icon: "⚙" },
];
const blankAnime = (collectionId = "", sortOrder = -1): AnimeForm => ({ id: crypto.randomUUID(), collectionId, slug: "", title: "", cardImageUrl: "", detailImageUrl: "", synopsis: "", streamingProviders: [], sortOrder, isPublished: true });
const formFromAnime = (entry: Anime): AnimeForm => ({ id: entry.id, collectionId: entry.collectionId, slug: entry.slug, title: entry.title, cardImageUrl: entry.cardImageUrl, detailImageUrl: entry.detailImageUrl, synopsis: entry.synopsis, streamingProviders: entry.streamingProviders, sortOrder: entry.sortOrder, isPublished: entry.isPublished });

export function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    const client = supabase;
    let active = true;
    void (async () => {
      try {
        const { data: { user }, error: userError } = await client.auth.getUser();
        if (userError || !user) return;
        const grant = await client.from("content_admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (grant.error) throw grant.error;
        if (active && grant.data) setAccount(user.email ?? "");
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Could not check editor access."); }
      finally { if (active) setChecking(false); }
    })();
    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setAccount(null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase || signingIn) return;
    setSigningIn(true); setError("");
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.user) throw new Error("Unable to sign in.");
      const grant = await supabase.from("content_admins").select("user_id").eq("user_id", result.data.user.id).maybeSingle();
      if (grant.error) throw grant.error;
      if (!grant.data) throw new Error("This account does not have editor access.");
      setAccount(result.data.user.email ?? email); setPassword("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign-in failed. Please try again."); }
    finally { setSigningIn(false); }
  };

  if (account !== null) return <AdminWorkspace email={account} />;
  return <AdminShell><Link to="/" className="editor-text-button">← Back to site</Link><section className="admin-panel mx-auto mt-12 max-w-md">
    <SectionTitle title="Content editor">Sign in to curate your anime archive.</SectionTitle>
    {!isSupabaseConfigured ? <p className="text-sm text-zinc-400">Configure Supabase in .env.local and restart the dev server.</p> : checking ? <p role="status">Checking editor access…</p> : <form onSubmit={signIn} className="grid gap-5">
      <Field label="Email" type="email" autoComplete="username" value={email} onChange={setEmail} /><Field label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} />
      <button disabled={signingIn} className="admin-button">{signingIn ? "Signing in…" : "Sign in"}</button>
    </form>}{error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
  </section></AdminShell>;
}

function AdminWorkspace({ email }: { email: string }) {
  const { anime, collections, settings, refresh, error: contentError } = useContent();
  const editableCollections = collectionPositions(collections);
  const [tab, setTab] = useState<Tab>("anime");
  const [step, setStep] = useState<"details" | "placement">("details");
  const [form, setForm] = useState<AnimeForm>(() => blankAnime(collections[0]?.id, firstFreePosition(anime.filter((item) => item.collectionId === collections[0]?.id))));
  const [baseline, setBaseline] = useState(form);
  const [collectionForm, setCollectionForm] = useState<Collection | null>(null);
  const [collectionBaseline, setCollectionBaseline] = useState<Collection | null>(null);
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const working = useRef(false);
  const [notice, setNotice] = useState<SaveNotice | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);
  const existing = anime.some((entry) => entry.id === form.id);
  const collectionEntries = anime.filter((entry) => entry.collectionId === form.collectionId);
  const canPlace = positionIsAvailable(collectionEntries, form.sortOrder, form.id);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (!settingsDirty) setSettingsForm(settings); }, [settings, settingsDirty]);
  useEffect(() => {
    if (!dirty && !collections.some((entry) => entry.id === form.collectionId) && collections[0]) {
      const updated = { ...form, collectionId: collections[0].id, sortOrder: firstFreePosition(anime.filter((entry) => entry.collectionId === collections[0].id)) };
      setForm(updated); setBaseline(updated);
    }
  }, [anime, collections, dirty, form]);
  useEffect(() => {
    const shelves = collectionPositions(collections);
    const isMainPage = collectionForm?.id === collections.find((collection) => collection.slug === "favorites")?.id;
    if (isMainPage || (shelves[0] && (!collectionForm || (!/^[0-9a-f]{8}-/i.test(collectionForm.id) && !shelves.some((entry) => entry.id === collectionForm.id))))) { setCollectionForm(shelves[0] ?? null); setCollectionBaseline(shelves[0] ?? null); }
  }, [collections, collectionForm]);

  const runAction = async (saving: string, success: string, action: () => Promise<void>) => {
    if (working.current) return;
    working.current = true; setBusy(true); setNotice({ kind: "saving", message: saving });
    try { await action(); setNotice({ kind: "success", message: success }); }
    catch (cause) { setNotice({ kind: "error", message: cause instanceof Error ? cause.message : typeof cause === "object" && cause && "message" in cause ? String(cause.message) : "Something went wrong. Please try again." }); }
    finally { working.current = false; setBusy(false); }
  };
  const replaceDraft = (next: AnimeForm) => {
    if (dirty && !window.confirm("Discard your unsaved anime changes?")) return;
    setForm(next); setBaseline(next); setStep("details");
  };
  const newAnime = () => replaceDraft(blankAnime(form.collectionId, firstFreePosition(collectionEntries)));
  const saveAnime = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.cardImageUrl.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      setStep("details"); setNotice({ kind: "error", message: "Choose an anime or enter a title, cover image, and a valid lowercase URL slug." }); return;
    }
    if (!canPlace || !collections.some((entry) => entry.id === form.collectionId)) {
      setStep("placement"); setNotice({ kind: "error", message: "Choose a collection and an available place in its 3×3." }); return;
    }
    void runAction("Saving anime…", `${form.title} saved.`, async () => {
      if (!supabase) throw new Error("The content service is not configured.");
      // Recheck the position against fresh rows before writing, including unpublished entries.
      const occupied = await supabase.from("anime").select("id,title").eq("collection_id", form.collectionId).eq("sort_order", form.sortOrder).neq("id", form.id);
      if (occupied.error) throw occupied.error;
      if (occupied.data?.length) { await refresh(); throw new Error("That place has just been occupied. Please select another one."); }
      const payload = { id: form.id, collection_id: form.collectionId, slug: form.slug, title: form.title.trim(), card_image_url: form.cardImageUrl, detail_image_url: form.detailImageUrl || form.cardImageUrl, synopsis: form.synopsis, streaming_providers: form.streamingProviders, sort_order: form.sortOrder, is_published: form.isPublished };
      const write = existing ? supabase.from("anime").update(payload).eq("id", form.id) : supabase.from("anime").insert(payload);
      const result = await write.select("id").single();
      if (result.error) throw result.error;
      setBaseline(form); await refresh();
    });
  };
  const deleteAnime = () => {
    if (!existing || !window.confirm(`Delete ${form.title}? This cannot be undone.`)) return;
    void runAction("Deleting anime…", "Anime deleted.", async () => {
      if (!supabase) throw new Error("The content service is not configured.");
      const result = await supabase.from("anime").delete().eq("id", form.id).select("id").single();
      if (result.error) throw result.error;
      const next = blankAnime(form.collectionId, form.sortOrder); setForm(next); setBaseline(next); await refresh();
    });
  };
  const chooseCollection = (next: Collection) => {
    if (JSON.stringify(collectionForm) !== JSON.stringify(collectionBaseline) && !window.confirm("Discard unsaved collection changes?")) return;
    setCollectionForm(next); setCollectionBaseline(next);
  };
  const saveCollection = (event: FormEvent) => {
    event.preventDefault(); if (!collectionForm) return;
    void runAction("Saving collection…", "Collection saved.", async () => {
      if (!supabase) throw new Error("The content service is not configured.");
      if (collectionForm.slug === "favorites") throw new Error("The favorites slug is reserved for the main page.");
      if (!positionIsAvailable(editableCollections, collectionForm.sortOrder, collectionForm.id)) throw new Error("Choose an available collection position.");
      const result = await supabase.from("collections").upsert({ id: collectionForm.id, slug: collectionForm.slug, title: collectionForm.title, eyebrow: collectionForm.eyebrow, description: collectionForm.description, cover_image_url: collectionForm.coverImageUrl, sort_order: collectionForm.sortOrder + 1, is_published: collectionForm.isPublished }).select("id").single();
      if (result.error) throw result.error;
      setCollectionBaseline(collectionForm); await refresh();
    });
  };
  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    void runAction("Saving site copy…", "Site copy saved.", async () => {
      if (!supabase) throw new Error("The content service is not configured.");
      const result = await supabase.from("site_settings").upsert({ id: true, home_title: settingsForm.homeTitle, archive_label: settingsForm.archiveLabel, about_title: settingsForm.aboutTitle, about_body: settingsForm.aboutBody, footer_text: settingsForm.footerText }).select("id").single();
      if (result.error) throw result.error;
      await refresh(); setSettingsDirty(false);
    });
  };

  return <AdminShell>
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><Link to="/" className="editor-text-button">← Back to site</Link><h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Your archive, your way.</h1><p className="mt-1 text-sm text-zinc-500">Choose a section. Make it yours.</p></div><button type="button" className="editor-secondary-button" disabled={busy} onClick={() => setSignOutOpen(true)}>Sign out</button></header>
    <nav aria-label="Editor sections" className="sticky top-0 z-20 mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-2 backdrop-blur-xl">
      {tabs.map((item) => <button key={item.id} type="button" aria-current={tab === item.id ? "page" : undefined} aria-controls={`editor-${item.id}`} disabled={busy} onClick={() => setTab(item.id)} className={`flex min-w-fit items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "bg-cyan-300 text-zinc-950" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
    </nav>
    {contentError && <p role="alert" className="mb-4 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-200">Content could not be refreshed: {contentError}</p>}
    <fieldset disabled={busy} className="min-w-0">
      <div id="editor-anime" hidden={tab !== "anime"}>
        <div className="editor-columns"><AnimeLibrary anime={anime} selectedId={form.id} onSelect={(entry) => replaceDraft(formFromAnime(entry))} onNew={newAnime} />
          <form onSubmit={saveAnime} className="admin-panel min-w-0 p-0!">
            <div className="flex items-center gap-3 border-b border-white/10 p-5"><Cover src={form.cardImageUrl} title="" className="h-14 w-11 rounded-lg" /><div className="min-w-0 flex-1"><p className="section-label">{existing ? "Edit anime" : "Add to your archive"}</p><h2 className="mt-1 truncate">{form.title || "Find your next favorite"}</h2></div>{dirty && <span className="text-xs text-amber-300">Unsaved</span>}</div>
            <div className="flex gap-2 px-5 pt-4">{(["details", "placement"] as const).map((item, index) => <button type="button" key={item} aria-pressed={step === item} onClick={() => setStep(item)} className={`rounded-full px-4 py-2 text-xs font-semibold ${step === item ? "bg-white/10 text-cyan-200" : "text-zinc-500 hover:text-white"}`}>{index + 1}. {item === "details" ? "Find & edit" : "Position & publish"}</button>)}</div>
            <div className="grid gap-5 p-5">
              {step === "details" ? <>
                <JikanAnimePicker key={form.id} onSelect={(entry) => setForm((current) => ({ ...current, ...animeImportFields(entry) }))} />
                <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} required={false} />
                <details className="rounded-xl border border-white/10 p-4"><summary className="text-sm font-semibold">Synopsis & image details</summary><div className="mt-4 grid gap-4"><TextArea label="Synopsis" rows={5} value={form.synopsis} onChange={(synopsis) => setForm({ ...form, synopsis })} /><Field label="Card image URL" value={form.cardImageUrl} onChange={(cardImageUrl) => setForm({ ...form, cardImageUrl })} required={false} /><Field label="Detail image URL" value={form.detailImageUrl} onChange={(detailImageUrl) => setForm({ ...form, detailImageUrl })} required={false} /><Field label="URL slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} required={false} /></div></details>
                <button type="button" className="editor-secondary-button justify-self-end" onClick={() => setStep("placement")}>Choose position →</button>
              </> : <>
                <label className="editor-label">Collection<select className="admin-input mt-1.5" value={form.collectionId} onChange={(event) => { const collectionId = event.target.value; setForm({ ...form, collectionId, sortOrder: firstFreePosition(anime.filter((entry) => entry.collectionId === collectionId), form.id) }); }}><option value="" disabled>Select a collection</option>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.title}</option>)}</select></label>
                <PositionPicker items={collectionEntries.map((entry) => ({ ...entry, image: entry.cardImageUrl }))} currentId={form.id} value={form.sortOrder} onChange={(sortOrder) => setForm({ ...form, sortOrder })} />
                <div className="flex flex-wrap gap-5 border-t border-white/10 pt-4">{(["netflix", "crunchyroll"] as const).map((provider) => <label key={provider} className="flex items-center gap-2 text-sm capitalize"><input type="checkbox" checked={form.streamingProviders.includes(provider)} onChange={() => setForm({ ...form, streamingProviders: form.streamingProviders.includes(provider) ? form.streamingProviders.filter((item) => item !== provider) : [...form.streamingProviders, provider] })} />{provider}</label>)}</div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />Publish on the site</label>
              </>}
            </div>
            <div className="sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-b-2xl border-t border-white/10 bg-zinc-950/95 p-4 backdrop-blur-lg"><div>{existing && <button type="button" className="px-2 py-2 text-sm text-red-300 hover:text-red-200" onClick={deleteAnime}>Delete anime</button>}</div><button className="admin-button" disabled={busy}>{busy ? "Saving…" : "Save anime"}</button></div>
          </form>
        </div>
      </div>
      <div id="editor-collections" hidden={tab !== "collections"}>
        <section className="admin-panel"><div className="mb-5 flex items-start justify-between gap-4"><SectionTitle title="Collections">Choose a shelf to edit, or create a new one.</SectionTitle><button type="button" className="editor-secondary-button" onClick={() => chooseCollection({ id: crypto.randomUUID(), slug: "", title: "", eyebrow: "Genre collection", description: "", coverImageUrl: "", sortOrder: firstFreePosition(editableCollections), isPublished: true })}>+ New collection</button></div>
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">{editableCollections.map((entry) => <button type="button" key={entry.id} aria-pressed={collectionForm?.id === entry.id} onClick={() => chooseCollection(entry)} className={`flex min-w-48 items-center gap-3 rounded-xl border p-3 text-left ${collectionForm?.id === entry.id ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 hover:bg-white/5"}`}><Cover src={entry.coverImageUrl} title="" className="h-12 w-12 rounded-lg" /><span className="text-sm font-semibold">{entry.title}</span></button>)}</div>
          {collectionForm && <form onSubmit={saveCollection} className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="grid gap-4"><Field label="Title" value={collectionForm.title} onChange={(title) => setCollectionForm({ ...collectionForm, title })} /><Field label="URL slug" value={collectionForm.slug} onChange={(slug) => setCollectionForm({ ...collectionForm, slug })} /><Field label="Eyebrow" value={collectionForm.eyebrow} onChange={(eyebrow) => setCollectionForm({ ...collectionForm, eyebrow })} /><TextArea label="Description" rows={3} value={collectionForm.description} onChange={(description) => setCollectionForm({ ...collectionForm, description })} /><Field label="Cover image URL" value={collectionForm.coverImageUrl} onChange={(coverImageUrl) => setCollectionForm({ ...collectionForm, coverImageUrl })} /></div><div className="grid content-start gap-5"><PositionPicker items={editableCollections.map((entry) => ({ ...entry, image: entry.coverImageUrl }))} currentId={collectionForm.id} value={collectionForm.sortOrder} onChange={(sortOrder) => setCollectionForm({ ...collectionForm, sortOrder })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={collectionForm.isPublished} onChange={(event) => setCollectionForm({ ...collectionForm, isPublished: event.target.checked })} />Published</label><button className="admin-button" disabled={busy}>Save collection</button></div></form>}
        </section>
      </div>
      <div id="editor-comments" hidden={tab !== "comments"}><EditorialComments busy={busy} runAction={runAction} /></div>
      <div id="editor-site" hidden={tab !== "site"}><section className="admin-panel max-w-3xl"><SectionTitle title="Site copy">Edit your introduction and the words around your archive.</SectionTitle><form onSubmit={saveSettings} className="grid gap-5">
        {([ ["homeTitle", "Home title"], ["archiveLabel", "Archive label"], ["aboutTitle", "About title"], ["footerText", "Footer text"] ] as const).map(([key, label]) => <Field key={key} label={label} value={settingsForm[key]} onChange={(value) => { setSettingsDirty(true); setSettingsForm({ ...settingsForm, [key]: value }); }} />)}
        <TextArea label="About body" value={settingsForm.aboutBody} onChange={(aboutBody) => { setSettingsDirty(true); setSettingsForm({ ...settingsForm, aboutBody }); }} /><button disabled={busy} className="admin-button">Save site copy</button>
      </form></section></div>
      <div id="editor-account" hidden={tab !== "account"}><PasswordSettings email={email} busy={busy} runAction={runAction} /></div>
    </fieldset>{signOutOpen && <SignOutDialog onCancel={() => setSignOutOpen(false)} onConfirm={() => { setSignOutOpen(false); void runAction("Signing out…", "Signed out.", async () => { const result = await supabase?.auth.signOut(); if (result?.error) throw result.error; }); }} />}<SaveToast notice={notice} onDismiss={dismissNotice} />
  </AdminShell>;
}

function AdminShell({ children }: { children: ReactNode }) {
  return <main className="page-surface min-h-screen px-4 py-6 text-zinc-100 sm:px-8 sm:py-8"><div className="mx-auto max-w-7xl">{children}</div></main>;
}
