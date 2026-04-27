"use client";

import { useState, useEffect } from 'react';
import { PenSquare, Book, Search, Moon, Sun, Download, Trash2, LogOut } from 'lucide-react';
import Editor from '@/components/Editor';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const session = localStorage.getItem('journal_session');
    if (!session) {
      router.push('/login');
    } else {
      setUser(session);
    }
  }, [router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('journal_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('journal_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('journal_session');
    router.push('/login');
  };

  // Convex Backend Hooks
  const entries = useQuery(api.entries.getEntries, user ? { userId: user } : "skip");
  const deleteEntry = useMutation(api.entries.deleteEntry);

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setIsWriting(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: any) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry({ id });
      } catch (err) {
        console.error("Failed to delete entry", err);
      }
    }
  };

  const handleSaveComplete = () => {
    setIsWriting(false);
    setEditingEntry(null);
  };

  const handleCancel = () => {
    setIsWriting(false);
    setEditingEntry(null);
  };

  const exportData = () => {
    if (!entries || entries.length === 0) return;
    
    let content = "# My Journal Export\n\n";
    entries.forEach(entry => {
      content += `## ${entry.title || 'Untitled'}\n`;
      content += `*Date: ${new Date(entry.createdAt).toLocaleDateString()}*\n`;
      if (entry.tags && entry.tags.length > 0) {
        content += `*Tags: ${entry.tags.join(', ')}*\n`;
      }
      content += `\n${entry.excerpt}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `journal-export-${new Date().toISOString().split('T')[0]}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = entries ? entries.filter(entry => 
    (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (entry.excerpt && entry.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.tags && entry.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  ) : [];

  if (!user) return null;

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--accent-color)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Book size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Journal</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)' }} title="Toggle Dark Mode">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={exportData} style={{ color: 'var(--text-secondary)' }} title="Export as Markdown">
            <Download size={20} />
          </button>
          <button onClick={handleLogout} style={{ color: 'var(--text-secondary)' }} title="Sign Out">
            <LogOut size={20} />
          </button>
          {!isWriting && (
            <button className="btn-primary" onClick={() => { setEditingEntry(null); setIsWriting(true); }}>
              <PenSquare size={18} />
              New Entry
            </button>
          )}
        </div>
      </header>

      {isWriting ? (
        <div className="card">
          <Editor initialEntry={editingEntry} onCancel={handleCancel} onSave={handleSaveComplete} />
        </div>
      ) : (
        <>
          {entries && entries.length > 0 && (
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search entries or tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color var(--transition-fast)'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {entries === undefined ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading entries...</p>
            ) : entries.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You don't have any journal entries yet.</p>
                <button className="btn-primary" onClick={() => { setEditingEntry(null); setIsWriting(true); }}>Start Writing</button>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No entries match your search.</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <article key={entry._id} className="card" style={{ cursor: 'pointer' }} onClick={() => handleEdit(entry)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '1.25rem', paddingRight: '2rem' }}>{entry.title || 'Untitled'}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={(e) => handleDelete(e, entry._id)}
                        style={{ color: '#ef4444', padding: '0.25rem', borderRadius: 'var(--radius-sm)', transition: 'background-color 0.2s' }}
                        title="Delete Entry"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {entry.excerpt || 'No additional text.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(entry.tags || []).map((tag: string) => (
                      <span key={tag} style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.6rem', 
                        backgroundColor: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 500
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
}
