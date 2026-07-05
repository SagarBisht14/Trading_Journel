export default function RichTextEditor({ value, onChange, placeholder = 'Write notes...' }) {
  return (
    <div
      className="min-h-[160px] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-slate-100 outline-none focus-within:border-brand/70"
      contentEditable
      role="textbox"
      aria-label={placeholder}
      data-placeholder={placeholder}
      onInput={(event) => onChange(event.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: value || '' }}
      suppressContentEditableWarning
    />
  );
}
