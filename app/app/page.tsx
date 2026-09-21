"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, NotebookPen, ExternalLink } from "lucide-react";
import {
  createScriptRecord,
  getCurrentUser,
  listScriptsForUser,
  saveScript,
  deleteScript,
} from "@/lib/storage";
import { DocumentUploader } from "@/components/ui/DocumentUploader";
import { calculateReadingTime, calculateWordCount } from "@/lib/teleprompt";

export default function ScriptLibraryPage() {
  const [search, setSearch] = useState("");
  const [scripts, setScripts] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (!currentUser) return;

    setScripts(listScriptsForUser(currentUser.id));
  }, []);

  const filteredScripts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return scripts;

    return scripts.filter((script) =>
      script.title.toLowerCase().includes(query),
    );
  }, [search, scripts]);

  const createSampleScript = () => {
    if (!user) return;

    const record = createScriptRecord({
      userId: user.id,
      title: "Product Launch",
      content: `Welcome to the launch of the new product.\n\nThis script is designed to help a speaker present the product clearly and confidently.`,
    });

    saveScript(record);
    setScripts(listScriptsForUser(user.id));
  };

  const handleScriptCreated = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    if (!user) return;

    const record = createScriptRecord({
      userId: user.id,
      title,
      content,
    });

    saveScript(record);
    setScripts(listScriptsForUser(user.id));
  };

  const handleDelete = (scriptId: string) => {
    deleteScript(scriptId);
    setScripts(listScriptsForUser(user?.id ?? ""));
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Private library
            </p>
            <h1 className="mt-2 text-3xl font-semibold">My Scripts</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={createSampleScript}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white"
            >
              <Plus size={16} />
              New Script
            </button>
            <DocumentUploader onScriptCreated={handleScriptCreated} />
          </div>
        </header>

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
          <Search size={16} className="text-neutral-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search scripts"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredScripts.map((script) => {
            const wordCount = calculateWordCount(script.content);
            const readingTime = calculateReadingTime(wordCount);

            return (
              <article
                key={script.id}
                className="flex min-h-[220px] flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                        Script
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-neutral-900">
                        {script.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete ${script.title}`}
                      onClick={() => handleDelete(script.id)}
                      className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-600">
                    <p>{wordCount} words</p>
                    <p>~{readingTime} min</p>
                    <p>
                      Updated{" "}
                      {new Date(script.updated_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2">
                  <Link
                    href={`/app/${script.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-3 py-2 text-sm font-medium text-white"
                  >
                    <NotebookPen size={15} />
                    Open
                  </Link>
                  <Link
                    href={`/app/${script.id}?mode=edit`}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/prompter/${script.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700"
                  >
                    <ExternalLink size={15} />
                    Prompter
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
