"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Save, X, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface EditorProps {
  initialEntry?: any;
  onCancel: () => void;
  onSave: () => void;
}

export default function Editor({ initialEntry, onCancel, onSave }: EditorProps) {
  const [title, setTitle] = useState(initialEntry ? initialEntry.title : '');
  const [tagsInput, setTagsInput] = useState(initialEntry && initialEntry.tags ? initialEntry.tags.join(', ') : '');
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(localStorage.getItem('journal_session'));
  }, []);

  const createEntry = useMutation(api.entries.createEntry);
  const updateEntry = useMutation(api.entries.updateEntry);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your thoughts here...',
      }),
    ],
    content: initialEntry ? initialEntry.content : '',
    immediatelyRender: false,
  });

  const handleSave = async () => {
    if (!editor || !user) return;
    
    setIsSaving(true);
    
    const contentHTML = editor.getHTML();
    const contentText = editor.getText();
    const excerpt = contentText.length > 100 ? contentText.substring(0, 100) + '...' : contentText;

    const tagsArray = tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);

    try {
      if (initialEntry) {
        await updateEntry({
          id: initialEntry._id,
          title: title.trim() === '' ? 'Untitled' : title,
          content: contentHTML,
          excerpt: excerpt,
          tags: tagsArray.length > 0 ? tagsArray : ['Journal'],
        });
      } else {
        await createEntry({
          userId: user,
          title: title.trim() === '' ? 'Untitled' : title,
          content: contentHTML,
          excerpt: excerpt,
          tags: tagsArray.length > 0 ? tagsArray : ['Journal'],
          createdAt: new Date().toISOString()
        });
      }
      onSave();
    } catch (e) {
      console.error("Failed to save entry", e);
      setIsSaving(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input 
        type="text" 
        placeholder="Entry Title" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSaving}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          width: '100%',
          fontFamily: 'inherit',
          opacity: isSaving ? 0.5 : 1
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', paddingBottom: '0.5rem' }}>
        <Hash size={16} />
        <input 
          type="text"
          placeholder="Tags (comma separated)... e.g., work, personal, travel"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          disabled={isSaving}
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            flexGrow: 1,
            opacity: isSaving ? 0.5 : 1
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          disabled={isSaving}
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ padding: '0.25rem', color: editor.isActive('bold') ? 'var(--accent-color)' : 'var(--text-secondary)' }}
        >
          <Bold size={18} />
        </button>
        <button 
          disabled={isSaving}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ padding: '0.25rem', color: editor.isActive('italic') ? 'var(--accent-color)' : 'var(--text-secondary)' }}
        >
          <Italic size={18} />
        </button>
        <button 
          disabled={isSaving}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{ padding: '0.25rem', color: editor.isActive('bulletList') ? 'var(--accent-color)' : 'var(--text-secondary)' }}
        >
          <List size={18} />
        </button>
        <button 
          disabled={isSaving}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{ padding: '0.25rem', color: editor.isActive('orderedList') ? 'var(--accent-color)' : 'var(--text-secondary)' }}
        >
          <ListOrdered size={18} />
        </button>
      </div>

      <div style={{ opacity: isSaving ? 0.5 : 1 }}>
        <EditorContent editor={editor} style={{ flexGrow: 1 }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={onCancel}
          disabled={isSaving}
          style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <X size={16} /> Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}
