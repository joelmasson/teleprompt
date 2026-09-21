"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createScriptRecord, getCurrentUser, saveScript } from "@/lib/storage";

export default function NewScriptPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled script");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!content.trim()) {
      setError("Add script content before saving.");
      return;
    }

    const script = createScriptRecord({
      userId: user.id,
      title: title.trim() || "Untitled script",
      content,
    });

    saveScript(script);
    router.push(`/app/${script.id}`);
  };

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">New script</p>
            <h1 className="mt-2 text-3xl font-semibold">Create a script</h1>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => router.push("/app")} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white">
              Save
            </button>
          </div>
        </div>

        <label className="mb-4 block text-sm font-medium text-neutral-700">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-3 text-base outline-none focus:border-neutral-900"
            placeholder="Product launch"
          />
        </label>

        {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-[60vh] w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-lg leading-8 text-neutral-900 outline-none focus:border-neutral-900"
          placeholder="Paste or type your script here..."
        />
      </div>
    </main>
  );
}
