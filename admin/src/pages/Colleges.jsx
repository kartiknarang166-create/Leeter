import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const BLANK = { name: '', slug: '', state: '', type: 'Engineering', logo_url: '' };

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, 'new' = create, id = edit
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const fetchColleges = () => {
    setLoading(true);
    api.get('/admin/colleges')
      .then(res => setColleges(res.data.colleges || []))
      .catch(() => toast.error('Failed to load colleges'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchColleges, []);

  const startEdit = (college) => {
    setEditing(college.id);
    setForm({ name: college.name, slug: college.slug, state: college.state || '', type: college.type || 'Engineering', logo_url: college.logo_url || '' });
  };

  const startNew = () => {
    setEditing('new');
    setForm(BLANK);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) return toast.error('Name and slug are required');
    setSaving(true);
    try {
      if (editing === 'new') {
        await api.post('/admin/colleges', form);
        toast.success('College created!');
      } else {
        await api.patch(`/admin/colleges/${editing}`, form);
        toast.success('College updated!');
      }
      setEditing(null);
      fetchColleges();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? All associated users will lose their college.`)) return;
    try {
      await api.delete(`/admin/colleges/${id}`);
      toast.success(`"${name}" deleted`);
      fetchColleges();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (editing) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '32rem' }}>
        <button onClick={() => setEditing(null)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          ← Back to Colleges
        </button>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {editing === 'new' ? 'Add College' : `Edit: ${form.name}`}
        </h2>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Maharaja Agrasen Institute of Technology" />
          </div>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Slug * (URL-safe)</label>
            <input className="input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} placeholder="mait-delhi" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>State</label>
              <input className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Maharashtra" />
            </div>
            <div>
              <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="Engineering">Engineering</option>
                <option value="IIT">IIT</option>
                <option value="NIT">NIT</option>
                <option value="BITS">BITS</option>
                <option value="IIIT">IIIT</option>
                <option value="Deemed">Deemed</option>
                <option value="State">State</option>
                <option value="Autonomous">Autonomous</option>
                <option value="Private">Private</option>
                <option value="Medical">Medical</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
          </div>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Logo URL</label>
            <input className="input" value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save College'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Colleges</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{colleges.length} institutions</p>
        </div>
        <button className="btn btn-primary" onClick={startNew}>+ Add College</button>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>City</th>
              <th>Users</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[1,2,3,4,5].map(j => <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>)}
                </tr>
              ))
            ) : colleges.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '2rem' }}>No colleges yet</td></tr>
            ) : (
              colleges.map((c, i) => (
                <tr key={c.id} style={{ animation: `fadeInUp 0.2s ease ${i * 0.02}s both` }}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><code style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{c.slug}</code></td>
                  <td style={{ color: 'var(--foreground-70)', fontSize: '0.85rem' }}>{c.city || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{c.users?.[0]?.count ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
