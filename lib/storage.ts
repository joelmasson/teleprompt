import { ScriptRecord, ScriptSettings, calculateWordCount } from "@/lib/teleprompt";

export type AuthUser = {
  id: string;
  email: string;
};

const USERS_KEY = "teleprompt_users";
const CURRENT_USER_KEY = "teleprompt_current_user";
const SCRIPTS_KEY = "teleprompt_scripts";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function ensureDemoUser(): AuthUser {
  const users = safeRead<AuthUser[]>(USERS_KEY, []);
  const existing = users[0];

  if (existing) {
    return existing;
  }

  const demoUser: AuthUser = {
    id: "demo-user",
    email: "demo@teleprompt.local",
  };

  safeWrite(USERS_KEY, [demoUser]);
  return demoUser;
}

export function getUsers(): AuthUser[] {
  return safeRead<AuthUser[]>(USERS_KEY, []);
}

export function saveUser(user: AuthUser) {
  const users = getUsers();
  const nextUsers = users.some((entry) => entry.email === user.email)
    ? users.map((entry) => (entry.email === user.email ? user : entry))
    : [...users, user];

  safeWrite(USERS_KEY, nextUsers);
}

export function getCurrentUser(): AuthUser | null {
  return safeRead<AuthUser | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: AuthUser | null) {
  safeWrite(CURRENT_USER_KEY, user);
}

export function logout() {
  setCurrentUser(null);
}

export function getScripts(): ScriptRecord[] {
  return safeRead<ScriptRecord[]>(SCRIPTS_KEY, []);
}

export function listScriptsForUser(userId: string): ScriptRecord[] {
  return getScripts()
    .filter((script) => script.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function saveScript(script: ScriptRecord) {
  const scripts = getScripts();
  const nextScripts = scripts.some((entry) => entry.id === script.id)
    ? scripts.map((entry) => (entry.id === script.id ? script : entry))
    : [script, ...scripts];

  safeWrite(SCRIPTS_KEY, nextScripts);
  return script;
}

export function deleteScript(scriptId: string) {
  const scripts = getScripts().filter((script) => script.id !== scriptId);
  safeWrite(SCRIPTS_KEY, scripts);
}

export function getScriptById(scriptId: string): ScriptRecord | undefined {
  return getScripts().find((script) => script.id === scriptId);
}

export function createScriptRecord(input: {
  userId: string;
  title: string;
  content: string;
  settings?: Partial<ScriptSettings>;
  id?: string;
}): ScriptRecord {
  const now = new Date().toISOString();
  const settings: ScriptSettings = {
    fontSize: 48,
    scrollSpeed: 120,
    lineSpacing: 1.5,
    textWidth: 72,
    textAlignment: "center",
    mirrorMode: false,
    lastPosition: 0,
    ...input.settings,
  };

  const record: ScriptRecord = {
    id: input.id ?? crypto.randomUUID(),
    user_id: input.userId,
    title: input.title || "Untitled script",
    content: input.content,
    word_count: calculateWordCount(input.content),
    created_at: now,
    updated_at: now,
    last_position: settings.lastPosition,
    font_size: settings.fontSize,
    scroll_speed: settings.scrollSpeed,
    line_spacing: settings.lineSpacing,
    text_width: settings.textWidth,
    text_alignment: settings.textAlignment,
    mirror_mode: settings.mirrorMode,
  };

  return record;
}

export function updateScriptSettings(
  scriptId: string,
  updates: Partial<ScriptRecord>,
): ScriptRecord | undefined {
  const scripts = getScripts();
  const target = scripts.find((script) => script.id === scriptId);

  if (!target) return undefined;

  const next = {
    ...target,
    ...updates,
    updated_at: new Date().toISOString(),
  } as ScriptRecord;

  saveScript(next);
  return next;
}

export function persistReadingPosition(scriptId: string, position: number) {
  const normalized = Math.min(Math.max(position, 0), 1);
  const script = getScriptById(scriptId);

  if (!script) return undefined;

  const next = {
    ...script,
    last_position: normalized,
    updated_at: new Date().toISOString(),
  };

  saveScript(next);
  return next;
}
