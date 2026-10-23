import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import Icon from '../../components/common/Icon'
import { cx } from '../../lib/format'

/**
 * Minimal rich-text editor. Output is cleaned again on the server
 * (HtmlSanitizer), so only safe formatting is ever published.
 */
export default function RichTextEditor({ value, onChange, id, invalid }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto', 'tel'] },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        id: id || '',
        class: 'prose-cms min-h-40 px-4 py-3 text-sm focus:outline-none',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  })

  // Sync when the value is replaced from outside (e.g. loading another record)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            link: e.isActive('link'),
          }
        : {},
  })

  if (!editor) return null

  const setLink = () => {
    const previous = editor.getAttributes('link').href || ''
    const url = window.prompt('Link address (https://…, /page, mailto: or tel:)', previous)
    if (url === null) return
    if (url === '') editor.chain().focus().unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const tools = [
    ['B', 'Bold', state.bold, () => editor.chain().focus().toggleBold().run(), 'font-extrabold'],
    ['I', 'Italic', state.italic, () => editor.chain().focus().toggleItalic().run(), 'italic font-serif text-base'],
    ['U', 'Underline', state.underline, () => editor.chain().focus().toggleUnderline().run(), 'underline'],
    ['H2', 'Heading', state.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'text-xs font-bold'],
    ['H3', 'Sub-heading', state.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'text-xs font-bold'],
    ['•', 'Bullet list', state.bullet, () => editor.chain().focus().toggleBulletList().run(), 'text-lg'],
    ['1.', 'Numbered list', state.ordered, () => editor.chain().focus().toggleOrderedList().run(), 'text-xs font-bold'],
    ['“', 'Quote', state.quote, () => editor.chain().focus().toggleBlockquote().run(), 'text-lg'],
  ]

  return (
    <div className={cx('overflow-hidden rounded-md border bg-white focus-within:border-navy-600 focus-within:ring-3 focus-within:ring-navy-600/15', invalid ? 'border-danger' : 'border-grey-200')}>
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5 border-b border-grey-100 bg-off px-1.5 py-1">
        {tools.map(([label, title, active, run, style]) => (
          <button
            key={title}
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={Boolean(active)}
            onClick={run}
            className={cx('grid h-8 min-w-8 place-items-center rounded px-1.5 text-sm text-grey-600 hover:bg-white hover:text-navy-900 aria-pressed:bg-white aria-pressed:text-navy-900 aria-pressed:shadow-sm', style)}
          >
            {label}
          </button>
        ))}
        <button type="button" title="Link" aria-label="Link" aria-pressed={Boolean(state.link)} onClick={setLink} className="grid size-8 place-items-center rounded text-grey-600 hover:bg-white hover:text-navy-900 aria-pressed:bg-white aria-pressed:text-navy-900">
          <Icon name="external" className="size-4" />
        </button>
        <span className="mx-1 w-px bg-grey-200" />
        <button type="button" title="Undo" aria-label="Undo" onClick={() => editor.chain().focus().undo().run()} className="grid size-8 place-items-center rounded text-grey-600 hover:bg-white">
          <Icon name="left" className="size-4" />
        </button>
        <button type="button" title="Redo" aria-label="Redo" onClick={() => editor.chain().focus().redo().run()} className="grid size-8 place-items-center rounded text-grey-600 hover:bg-white">
          <Icon name="right" className="size-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
