"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "magyna:language";

export default function LanguagePicker({
  languages,
}: {
  languages: { code: string; name: string }[];
}) {
  const [selected, setSelected] = useState("kk");

  useEffect(() => {
    setSelected(localStorage.getItem(STORAGE_KEY) || "kk");
  }, []);

  function choose(code: string) {
    setSelected(code);
    localStorage.setItem(STORAGE_KEY, code);
  }

  return (
    <select
      value={selected}
      onChange={(e) => choose(e.target.value)}
      className="input max-w-xs"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.name}
        </option>
      ))}
    </select>
  );
}
