"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, getScriptById, saveScript, updateScriptSettings } from "@/lib/storage";
import { calculateWordCount } from "@/lib/teleprompt";
import { SaveStatus } from "@/components/ui/SaveStatus";

export default function ScriptEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scriptId = String(params.id);
  const isEditMode = searchParams.get("mode") === "edit";
  const [script, setScript] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    const found = getScriptById(scriptId);
    if (!found || found.user_id !== currentUser.id) {
      router.replace("/app");
      return;
    }

    setScript(found);
    setTitle(found.title);
    setContent(found.content);
  }, [router, scriptId]);

  useEffect(() => {
    if (!script) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      const next = {
        ...script,
        title,
        content,
        word_count: calculateWordCount(content),
        updated_at: new Date().toISOString(),
      };

      saveScript(next);
      setScript(next);
      setIsSaving(false);
      setIsSaved(true);

      const reset = window.setTimeout(() => setIsSaved(false), 1200);
      return () => window.clearTimeout(reset);
    }, 600);

    return () => clearTimeout(timer);
  }, [content, title, script]);

  const readingStats = useMemo(() => {
    const words = calculateWordCount(content);
    return {
      words,
      minutes: Math.max(1, Math.ceil(words / 140)),
    };
  }, [content]);

  if (!script) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Script editor</p>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full bg-transparent text-2xl font-semibold text-neutral-950 outline-none"
              aria-label="Script title"
            />
          </div>

          <div className="flex items-center gap-3">
            <SaveStatus isSaving={isSaving} isSaved={isSaved} />
            <button
              type="button"
              onClick={() => router.push(`/prompter/${scriptId}`)}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
            >
              Launch prompter
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 shadow-sm">
          <span>{readingStats.words} words</span>
          <span>•</span>
          <span>~{readingStats.minutes} min</span>
          <span>•</span>
          <span>{isEditMode ? "Editing" : "Viewing"}</span>
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-[70vh] w-full rounded-3xl border border-neutral-200 bg-white p-6 text-lg leading-8 text-neutral-900 shadow-sm outline-none ring-0 focus:border-neutral-900"
          aria-label="Script content"
          placeholder="Paste or type your script here..."
        />
      </div>
    </main>
  );
}
