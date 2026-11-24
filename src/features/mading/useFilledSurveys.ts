import { useCallback, useState } from "react";

const STORAGE_KEY = "fts26:surveypanel:filled:v1";

function readStoredKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeStoredKeys(keys: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // Private browsing or quota errors ignored cleanly
  }
}

/**
 * Tracks locally completed questionnaires per course/class feed in browser storage
 * so respondents never get duplicate random picks and can mark progress effortlessly.
 */
export function useFilledSurveys(sourceKey: string) {
  const [filledKeys, setFilledKeys] = useState<string[]>(() =>
    readStoredKeys()
  );

  const prefix = `${sourceKey}::`;

  const isFilled = useCallback(
    (groupId: string) => filledKeys.includes(`${prefix}${groupId}`),
    [filledKeys, prefix]
  );

  const markFilled = useCallback(
    (groupId: string) => {
      const fullKey = `${prefix}${groupId}`;
      setFilledKeys((prev) => {
        if (prev.includes(fullKey)) return prev;
        const next = [...prev, fullKey];
        writeStoredKeys(next);
        return next;
      });
    },
    [prefix]
  );

  const toggleFilled = useCallback(
    (groupId: string) => {
      const fullKey = `${prefix}${groupId}`;
      setFilledKeys((prev) => {
        const next = prev.includes(fullKey)
          ? prev.filter((item) => item !== fullKey)
          : [...prev, fullKey];
        writeStoredKeys(next);
        return next;
      });
    },
    [prefix]
  );

  const clearSourceFilled = useCallback(() => {
    setFilledKeys((prev) => {
      const next = prev.filter((item) => !item.startsWith(prefix));
      writeStoredKeys(next);
      return next;
    });
  }, [prefix]);

  return { isFilled, markFilled, toggleFilled, clearSourceFilled };
}
