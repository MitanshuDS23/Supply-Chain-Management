import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react'
import { Products as ProductsApi, Suppliers as SuppliersApi, errMsg, msgOf } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import {
  Button, Card, Table, Modal, ConfirmDialog, Field, Input, Textarea, Select,
  Loading, EmptyState, Badge, money, num,
} from '../components/ui.jsx'

const empty = { name: '', category: '', description: '', price: '', barcode: '', supplierId: '', supplierName: '', quantity: '' }

export default function Products() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [modal, setModal] = useState(null) // {mode, data}
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState(null)
  const [busyDel, setBusyDel] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([ProductsApi.list(), SuppliersApi.list().catch(() => [])])
      setItems(p.items)
      setSuppliers(Array.isArray(s) ? s : [])
    } catch (e) { toast.error('Failed to load products', errMsg(e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const categories = useMemo(() => [...new Set(items.map((i) => i.category).filter(Boolean))], [items])
  const filtered = useMemo(() => items.filter((i) => {
    const okQ = !q || `${i.name} ${i.barcode} ${i.supplierName}`.toLowerCase().includes(q.toLowerCase())
    const okC = !cat || i.category === cat
    return okQ && okC
  }), [items, q, cat])

  const openCreate = () => setModal({ mode: 'create', data: { ...empty } })
  const openEdit = (p) => setModal({ mode: 'edit', data: { ...empty, ...p, price: p.price ?? '', quantity: p.quantity ?? '' } })

  const save = async (e) => {
    e.preventDefault()
    const d = modal.data
    if (!d.name?.trim()) return toast.error('Name is required')
    const body = {
      name: d.name.trim(), category: d.category || null, description: d.description || null,
      price: d.price === '' ? 0 : Number(d.price), barcode: d.barcode || null,
      supplierId: d.supplierId || null, supplierName: d.supplierName || null,
      quantity: d.quantity === '' ? 0 : Number(d.quantity),
    }
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        const r = await ProductsApi.create(body)
        toast.success('Product created', msgOf(r))
      } else {
        const r = await ProductsApi.update(modal.data.id, body)
        toast.success('Product updated', msgOf(r))
      }
      setModal(null); load()
    } catch (err) { toast.error('Save failed', errMsg(err)) }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    setBusyDel(true)
    try {
      const r = await ProductsApi.remove(del.id)
      toast.success('Product deleted', msgOf(r)); setDel(null); load()
    } catch (err) { toast.error('Delete failed', errMsg(err)) }
    finally { setBusyDel(false) }
  }

  const onSupplierPick = (id) => {
    const s = suppliers.find((x) => String(x.id) === String(id))
    setModal((m) => ({ ...m, data: { ...m.data, supplierId: id, supplierName: s?.name || m.data.supplierName } }))
  }

  return (
    <>
      <div className="page-head">
        <div><h2>Products</h2><p>{num(items.length)} products in catalog</p></div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>Add product</Button>
      </div>

      <div className="toolbar">
        <div className="search"><Search size={16} /><input placeholder="Search by name, barcode, supplier…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <Card noBody>
        {loading ? <Loading label="Loading products…" />
          : filtered.length === 0 ? <EmptyState icon={Package} title="No products found" message={q || cat ? 'Try adjusting your filters.' : 'Add your first product to get started.'} action={!q && !cat && <Button variant="primary" icon={Plus} onClick={openCreate}>Add product</Button>} />
          : (
            <Table columns={[
              { label: 'Product' }, { label: 'Category' }, { label: 'Supplier' },
              { label: 'Price', num: true }, { label: 'Qty', num: true }, { label: '', width: 90 },
            ]}>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-strong">{p.name}</div>
                    <div className="cell-sub">#{p.id}{p.barcode ? ` · ${p.barcode}` : ''}</div>
                  </td>
                  <td>{p.category ? <Badge tone="neutral">{p.category}</Badge> : <span className="faint">—</span>}</td>
                  <td>{p.supplierName || <span className="faint">—</span>}</td>
                  <td className="num mono">{money(p.price)}</td>
                  <td className="num mono">{num(p.quantity)}</td>
                  <td>
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                      <Button variant="ghost" size="sm" className="btn-icon" title="Edit" onClick={() => openEdit(p)}><Pencil size={15} /></Button>
                      <Button variant="ghost" size="sm" className="btn-icon" title="Delete" onClick={() => setDel(p)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
      </Card>

      <Modal
        open={!!modal} onClose={() => setModal(null)} size="lg"
        title={modal?.mode === 'create' ? 'Add product' : 'Edit product'}
        footer={<>
          <Button onClick={() => setModal(null)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save product'}</Button>
        </>}
      >
        {modal && (
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Name" full><Input autoFocus value={modal.data.name} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} required /></Field>
              <Field label="Category"><Input list="cats" value={modal.data.category} onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })} />
                <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              <Field label="Barcode"><Input value={modal.data.barcode} onChange={(e) => setModal({ ...modal, data: { ...modal.data, barcode: e.target.value } })} /></Field>
              <Field label="Price (₹)"><Input type="number" step="0.01" min="0" value={modal.data.price} onChange={(e) => setModal({ ...modal, data: { ...modal.data, price: e.target.value } })} /></Field>
              <Field label="Quantity"><Input type="number" min="0" value={modal.data.quantity} onChange={(e) => setModal({ ...modal, data: { ...modal.data, quantity: e.target.value } })} hint="" /></Field>
              <Field label="Supplier">
                <Select value={modal.data.supplierId || ''} onChange={(e) => onSupplierPick(e.target.value)}>
                  <option value="">— none —</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>)}
                </Select>
              </Field>
              <Field label="Description" full><Textarea value={modal.data.description || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })} /></Field>
            </div>
            {modal.mode === 'create' && <p className="faint" style={{ fontSize: 12, margin: 0 }}>An inventory record is auto-created for new products with the given quantity as starting stock.</p>}
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} busy={busyDel}
        title="Delete product" message={`Delete "${del?.name}"? This cannot be undone.`}
      />
    </>
  )
}
