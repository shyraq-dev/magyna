'use client';

import { useEffect, useRef } from 'react';

const TOOLBAR: { cmd: string; label: string; value?: string }[] = [
  { cmd: 'bold', label: 'Ж' },
  { cmd: 'italic', label: 'К' },
  { cmd: 'underline', label: 'А' },
  { cmd: 'justifyLeft', label: '⯇' },
  { cmd: 'justifyCenter', label: '≡' },
  { cmd: 'justifyRight', label: '⯈' },
  { cmd: 'indent', label: '⇥' },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Тек бастапқы жүктелуде ғана DOM-ды сырттан толтырамыз —
    // әйтпесе курсор орны әр өзгерісте секіріп кетеді.
    if (isFirstRender.current && editorRef.current) {
      editorRef.current.innerHTML = value || '';
      isFirstRender.current = false;
    }
  }, [value]);

  function exec(cmd: string) {
    document.execCommand('defaultParagraphSeparator', false, 'p');
    document.execCommand(cmd, false);
    editorRef.current?.focus();
    handleInput();
  }

  function handleInput() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  return (
    <div className="rounded-md border border-night-600 bg-night-900">
      <div className="flex flex-wrap gap-1 border-b border-night-700 p-2">
        {TOOLBAR.map((t) => (
          <button
            key={t.cmd}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd)}
            className="focus-ring h-8 w-8 rounded border border-night-600 text-sm hover:border-ember-500"
            title={t.cmd}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="prose-reader min-h-[400px] w-full px-4 py-3 text-base leading-relaxed outline-none empty:before:text-parchment-200/30 empty:before:content-[attr(data-placeholder)]"
        suppressContentEditableWarning
      />
    </div>
  );
}
