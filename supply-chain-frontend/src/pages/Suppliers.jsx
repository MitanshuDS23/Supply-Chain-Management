import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Truck, Star, Mail, Phone } from 'lucide-react'
import { Suppliers as Api, errMsg, msgOf } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import {
  Button, Card, Table, Modal, ConfirmDialog, Field, Input, Textarea,
  Loading, EmptyState, num,
} from '../components/ui.jsx'

const empty = { id: '', name: '', contactPerson: '', email: '', phone: '', address: '', rating: '' }

function Stars({ value = 0 }) {
  return (
    <span className="row" style={{ gap: 2 }} title={`${value ?? 0} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= Math.round(value || 0) ? '#f59e0b' : 'none'} color={i <= Math.round(value || 0) ? '#f59e0b' : 'var(--border-strong)'} />
      ))}
      <span className="mono faint" style={{ marginLeft: 4, fontSize: 12 }}>{value != null ? Number(value).toFixed(1) : '—'}</span>
    </span>
  )
}

export default function Suppliers() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState(null)
  const [busyDel, setBusyDel] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setItems(await Api.list()) }
    catch (e) { toast.error('Failed to load suppliers', errMsg(e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => items.filter((s) =>
    !q || `${s.name} ${s.id} ${s.email} ${s.contactPerson}`.toLowerCase().includes(q.toLowerCase())
  ), [items, q])

  const openCreate = () => setModal({ mode: 'create', data: { ...empty } })
  const openEdit = (s) => setModal({ mode: 'edit', data: { ...empty, ...s, rating: s.rating ?? '' } })

  const save = async (e) => {
    e.preventDefault()
    const d = modal.data
    if (!d.id?.trim()) return toast.error('Supplier ID is required')
    if (!d.name?.trim()) return toast.error('Name is required')
    const body = {
      id: d.id.trim(), name: d.name.trim(), contactPerson: d.contactPerson || null,
      email: d.email || null, phone: d.phone || null, address: d.address || null,
      rating: d.rating === '' ? null : Number(d.rating),
    }
    setSaving(true)
    try {
      const r = modal.mode === 'create' ? await Api.create(body) : await Api.update(d.id.trim(), body)
      toast.success(modal.mode === 'create' ? 'Supplier created' : 'Supplier updated', msgOf(r))
      setModal(null); load()
    } catch (err) { toast.error('Save failed', errMsg(err)) }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    setBusyDel(true)
    try { const r = await Api.remove(del.id); toast.success('Supplier deleted', msgOf(r)); setDel(null); load() }
    catch (err) { toast.error('Delete failed', errMsg(err)) }
    finally { setBusyDel(false) }
  }

  return (
    <>
      <div className="page-head">
        <div><h2>Suppliers</h2><p>{num(items.length)} suppliers</p></div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>Add supplier</Button>
      </div>

      <div className="toolbar">
        <div className="search"><Search size={16} /><input placeholder="Search suppliers…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <Card noBody>
        {loading ? <Loading label="Loading suppliers…" />
          : filtered.length === 0 ? <EmptyState icon={Truck} title="No suppliers found" message={q ? 'Try another search.' : 'Add your first supplier.'} action={!q && <Button variant="primary" icon={Plus} onClick={openCreate}>Add supplier</Button>} />
          : (
            <Table columns={[{ label: 'Supplier' }, { label: 'Contact' }, { label: 'Rating' }, { label: '', width: 90 }]}>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="cell-strong">{s.name}</div>
                    <div className="cell-sub">#{s.id}{s.contactPerson ? ` · ${s.contactPerson}` : ''}</div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 14 }}>
                      {s.email && <span className="row faint" style={{ gap: 5, fontSize: 12.5 }}><Mail size={13} />{s.email}</span>}
                      {s.phone && <span className="row faint" style={{ gap: 5, fontSize: 12.5 }}><Phone size={13} />{s.phone}</span>}
                      {!s.email && !s.phone && <span className="faint">—</span>}
                    </div>
                  </td>
                  <td><Stars value={s.rating} /></td>
                  <td>
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                      <Button variant="ghost" size="sm" className="btn-icon" title="Edit" onClick={() => openEdit(s)}><Pencil size={15} /></Button>
                      <Button variant="ghost" size="sm" className="btn-icon" title="Delete" onClick={() => setDel(s)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
      </Card>

      <Modal
        open={!!modal} onClose={() => setModal(null)} size="lg"
        title={modal?.mode === 'create' ? 'Add supplier' : 'Edit supplier'}
        footer={<>
          <Button onClick={() => setModal(null)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save supplier'}</Button>
        </>}
      >
        {modal && (
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Supplier ID" hint={modal.mode === 'edit' ? '(read-only)' : 'unique'}>
                <Input value={modal.data.id} disabled={modal.mode === 'edit'} onChange={(e) => setModal({ ...modal, data: { ...modal.data, id: e.target.value } })} required />
              </Field>
              <Field label="Name"><Input value={modal.data.name} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} required /></Field>
              <Field label="Contact person"><Input value={modal.data.contactPerson || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, contactPerson: e.target.value } })} /></Field>
              <Field label="Rating" hint="0–5"><Input type="number" step="0.1" min="0" max="5" value={modal.data.rating} onChange={(e) => setModal({ ...modal, data: { ...modal.data, rating: e.target.value } })} /></Field>
              <Field label="Email"><Input type="email" value={modal.data.email || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, email: e.target.value } })} /></Field>
              <Field label="Phone"><Input value={modal.data.phone || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, phone: e.target.value } })} /></Field>
              <Field label="Address" full><Textarea value={modal.data.address || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, address: e.target.value } })} /></Field>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} busy={busyDel}
        title="Delete supplier" message={`Delete "${del?.name}"? This cannot be undone.`}
      />
    </>
  )
}
