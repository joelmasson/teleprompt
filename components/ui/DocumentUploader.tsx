"use client";

import { useRef, useState } from "react";
import * as mammoth from "mammoth";
import { Upload } from "lucide-react";

export function DocumentUploader({
  onScriptCreated,
}: {
  onScriptCreated: (input: { title: string; content: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const readFileAsText = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "txt") {
      return await file.text();
    }

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return result.value;
    }

    throw new Error("Unsupported file type. Upload a .txt or .docx document.");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");

    try {
      const text = await readFileAsText(file);
      if (!text.trim()) {
        throw new Error("The uploaded document did not contain any readable text.");
      }

      onScriptCreated({
        title: file.name.replace(/\.[^.]+$/, "") || "Imported script",
        content: text,
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to parse the uploaded file.");
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800"
      >
        <Upload size={16} />
        {isLoading ? "Importing..." : "Upload .txt / .docx"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
