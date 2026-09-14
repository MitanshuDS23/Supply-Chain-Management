import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Trash2, KeyRound, Users as UsersIcon, Mail } from 'lucide-react'
import { Users as Api, errMsg, msgOf } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Button, Card, Table, Modal, ConfirmDialog, Field, Input, Select,
  Loading, EmptyState, Badge, StatusBadge, initials, dt,
} from '../components/ui.jsx'

const emptyUser = { id: '', fullName: '', email: '', password: '', type: 'staff' }

export default function Users() {
  const toast = useToast()
  const { user: me } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [add, setAdd] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState(null)
  const [del, setDel] = useState(null)
  const [busyDel, setBusyDel] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const data = await Api.list(0, 200); setItems(Array.isArray(data) ? data : []) }
    catch (e) { toast.error('Failed to load users', errMsg(e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const roles = useMemo(() => [...new Set(items.map((u) => u.type).filter(Boolean))], [items])
  const filtered = useMemo(() => items.filter((u) => {
    const okQ = !q || `${u.id} ${u.fullName} ${u.email}`.toLowerCase().includes(q.toLowerCase())
    return okQ && (!role || u.type === role)
  }), [items, q, role])

  const saveUser = async (e) => {
    e.preventDefault()
    const d = add
    if (!d.id.trim()) return toast.error('Username is required')
    if (!d.email.trim()) return toast.error('Email is required')
    setSaving(true)
    try {
      const r = await Api.add({ ...d, id: d.id.trim(), email: d.email.trim() })
      toast.success('User created', msgOf(r)); setAdd(null); load()
    } catch (err) { toast.error('Create failed', errMsg(err)) }
    finally { setSaving(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (!pw.newpassword) return toast.error('Enter a new password')
    setSaving(true)
    try {
      const r = await Api.updatePassword(pw.id, pw.oldpassword || '', pw.newpassword)
      toast.success('Password updated', msgOf(r)); setPw(null)
    } catch (err) { toast.error('Update failed', errMsg(err)) }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    setBusyDel(true)
    try { const r = await Api.remove(del.id); toast.success('User deleted', msgOf(r)); setDel(null); load() }
    catch (e) { toast.error('Delete failed', errMsg(e)) }
    finally { setBusyDel(false) }
  }

  return (
    <>
      <div className="page-head">
        <div><h2>Users</h2><p>{items.length} user accounts</p></div>
        <Button variant="primary" icon={Plus} onClick={() => setAdd({ ...emptyUser })}>Add user</Button>
      </div>

      <div className="toolbar">
        <div className="search"><Search size={16} /><input placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All roles</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
      </div>

      <Card noBody>
        {loading ? <Loading label="Loading users…" />
          : filtered.length === 0 ? <EmptyState icon={UsersIcon} title="No users found" message={q || role ? 'Try adjusting filters.' : 'Add your first user.'} />
          : (
            <Table columns={[{ label: 'User' }, { label: 'Email' }, { label: 'Role' }, { label: 'Status' }, { label: 'Created' }, { label: '', width: 90 }]}>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="row" style={{ gap: 11 }}>
                      <div className="avatar" style={{ width: 34, height: 34 }}>{initials(u.fullName || u.id)}</div>
                      <div>
                        <div className="cell-strong">{u.fullName || u.id} {me?.id === u.id && <span className="faint" style={{ fontWeight: 400, fontSize: 11.5 }}>(you)</span>}</div>
                        <div className="cell-sub">@{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="row faint" style={{ gap: 5, fontSize: 12.5 }}>{u.email ? <><Mail size={13} />{u.email}</> : '—'}</span></td>
                  <td><StatusBadge status={u.type || 'user'} /></td>
                  <td>{u.isActive === false ? <Badge tone="neutral" dot>Inactive</Badge> : <Badge tone="success" dot>Active</Badge>}</td>
                  <td className="faint" style={{ fontSize: 12.5 }}>{dt(u.createdAt)}</td>
                  <td>
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                      <Button variant="ghost" size="sm" className="btn-icon" title="Change password" onClick={() => setPw({ id: u.id, oldpassword: '', newpassword: '' })}><KeyRound size={15} /></Button>
                      <Button variant="ghost" size="sm" className="btn-icon" title="Delete" onClick={() => setDel(u)} style={{ color: 'var(--danger)' }} disabled={me?.id === u.id}><Trash2 size={15} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
      </Card>

      {/* Add user */}
      <Modal open={!!add} onClose={() => setAdd(null)} title="Add user"
        footer={<><Button onClick={() => setAdd(null)} disabled={saving}>Cancel</Button><Button variant="primary" onClick={saveUser} disabled={saving}>{saving ? 'Saving…' : 'Create user'}</Button></>}>
        {add && (
          <form onSubmit={saveUser}>
            <div className="form-grid">
              <Field label="Username" hint="unique"><Input autoFocus value={add.id} onChange={(e) => setAdd({ ...add, id: e.target.value })} required /></Field>
              <Field label="Full name"><Input value={add.fullName} onChange={(e) => setAdd({ ...add, fullName: e.target.value })} /></Field>
              <Field label="Email" full><Input type="email" value={add.email} onChange={(e) => setAdd({ ...add, email: e.target.value })} required /></Field>
              <Field label="Password"><Input type="password" value={add.password} onChange={(e) => setAdd({ ...add, password: e.target.value })} /></Field>
              <Field label="Role">
                <Select value={add.type} onChange={(e) => setAdd({ ...add, type: e.target.value })}>
                  <option value="staff">Staff</option><option value="manager">Manager</option><option value="admin">Admin</option>
                </Select>
              </Field>
            </div>
          </form>
        )}
      </Modal>

      {/* Change password */}
      <Modal open={!!pw} onClose={() => setPw(null)} title={pw ? `Change password · @${pw.id}` : ''}
        footer={<><Button onClick={() => setPw(null)} disabled={saving}>Cancel</Button><Button variant="primary" onClick={savePassword} disabled={saving}>{saving ? 'Saving…' : 'Update password'}</Button></>}>
        {pw && (
          <form onSubmit={savePassword}>
            <Field label="Current password" hint="(optional)"><Input type="password" value={pw.oldpassword} onChange={(e) => setPw({ ...pw, oldpassword: e.target.value })} /></Field>
            <Field label="New password"><Input type="password" value={pw.newpassword} onChange={(e) => setPw({ ...pw, newpassword: e.target.value })} required /></Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} busy={busyDel} title="Delete user" message={`Delete user "${del?.fullName || del?.id}"? This cannot be undone.`} />
    </>
  )
}
