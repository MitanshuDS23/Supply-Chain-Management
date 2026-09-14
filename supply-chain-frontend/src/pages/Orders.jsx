import { useEffect, useMemo, useState } from 'react'
import { Plus, ShoppingCart, Eye, Trash2, Check, Truck, PackageCheck, X } from 'lucide-react'
import { Orders as Api, Products as ProductsApi, errMsg, msgOf } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import {
  Button, Card, Table, Modal, ConfirmDialog, Field, Input, Textarea, Select,
  Loading, EmptyState, StatusBadge, money, num, dtTime,
} from '../components/ui.jsx'

const STATUSES = ['All', 'Placed', 'Accepted', 'Transferred', 'Delivered']

export default function Orders() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [view, setView] = useState(null)
  const [del, setDel] = useState(null)
  const [busyDel, setBusyDel] = useState(false)
  const [creating, setCreating] = useState(false)
  const [transferId, setTransferId] = useState('')
  const [rowBusy, setRowBusy] = useState(0)

  // create form
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customerid: '', notes: '', lines: [{ productId: '', quantity: 1 }] })

  const load = async () => {
    setLoading(true)
    try {
      const [o, p] = await Promise.all([Api.list(), ProductsApi.list().catch(() => ({ items: [] }))])
      setItems(o.items.sort((a, b) => b.id - a.id))
      setProducts(p.items || [])
    } catch (e) { toast.error('Failed to load orders', errMsg(e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => tab === 'All' ? items : items.filter((o) => o.status === tab), [items, tab])
  const counts = useMemo(() => {
    const c = { All: items.length }
    for (const s of STATUSES.slice(1)) c[s] = items.filter((o) => o.status === s).length
    return c
  }, [items])

  const lineTotal = (l) => {
    const p = products.find((x) => String(x.id) === String(l.productId))
    return (p?.price || 0) * (Number(l.quantity) || 0)
  }
  const formTotal = form.lines.reduce((s, l) => s + lineTotal(l), 0)

  const setLine = (i, patch) => setForm((f) => ({ ...f, lines: f.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }))
  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, { productId: '', quantity: 1 }] }))
  const rmLine = (i) => setForm((f) => ({ ...f, lines: f.lines.filter((_, j) => j !== i) }))

  const placeOrder = async (e) => {
    e.preventDefault()
    const validLines = form.lines.filter((l) => l.productId && Number(l.quantity) > 0)
    if (!form.customerid.trim()) return toast.error('Customer is required')
    if (validLines.length === 0) return toast.error('Add at least one item')
    const body = {
      customerid: form.customerid.trim(),
      status: 'Placed',
      notes: form.notes || null,
      totalAmount: formTotal,
      items: validLines.map((l) => {
        const p = products.find((x) => String(x.id) === String(l.productId))
        return { productId: Number(l.productId), productName: p?.name, quantity: Number(l.quantity), unitPrice: p?.price || 0 }
      }),
    }
    setCreating(true)
    try {
      const r = await Api.place(body)
      toast.success('Order placed', msgOf(r))
      setOpen(false); setForm({ customerid: '', notes: '', lines: [{ productId: '', quantity: 1 }] })
      load()
    } catch (err) { toast.error('Could not place order', errMsg(err)) }
    finally { setCreating(false) }
  }

  const act = async (fn, id, label) => {
    setRowBusy(id)
    try { const r = await fn(); toast.success(label, msgOf(r)); await load(); if (view?.id === id) { try { setView(await Api.get(id)) } catch { setView(null) } } }
    catch (e) { toast.error('Action failed', errMsg(e)) }
    finally { setRowBusy(0) }
  }

  const doTransfer = async () => {
    if (!transferId.trim()) return toast.error('Enter a delivery person ID')
    await act(() => Api.transfer(view.id, transferId.trim()), view.id, 'Order transferred')
    setTransferId('')
  }

  const confirmDelete = async () => {
    setBusyDel(true)
    try { const r = await Api.remove(del.id); toast.success('Order deleted', msgOf(r)); setDel(null); setView(null); load() }
    catch (e) { toast.error('Delete failed', errMsg(e)) }
    finally { setBusyDel(false) }
  }

  return (
    <>
      <div className="page-head">
        <div><h2>Orders</h2><p>{num(items.length)} total orders</p></div>
        <Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>New order</Button>
      </div>

      <div className="tabs" style={{ maxWidth: 560, marginBottom: 18 }}>
        {STATUSES.map((s) => (
          <button key={s} className={tab === s ? 'active' : ''} onClick={() => setTab(s)}>
            {s} {counts[s] != null && <span className="faint" style={{ fontSize: 11 }}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      <Card noBody>
        {loading ? <Loading label="Loading orders…" />
          : filtered.length === 0 ? <EmptyState icon={ShoppingCart} title="No orders" message={tab === 'All' ? 'Place your first order.' : `No ${tab.toLowerCase()} orders.`} action={tab === 'All' && <Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>New order</Button>} />
          : (
            <Table columns={[
              { label: 'Order' }, { label: 'Customer' }, { label: 'Items', num: true },
              { label: 'Total', num: true }, { label: 'Status' }, { label: 'Date' }, { label: '', width: 150 },
            ]}>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="cell-strong">#{o.id}</td>
                  <td>{o.customerid || <span className="faint">—</span>}</td>
                  <td className="num mono">{o.items?.length ?? 0}</td>
                  <td className="num mono">{money(o.totalAmount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="faint" style={{ fontSize: 12.5 }}>{dtTime(o.orderDate)}</td>
                  <td>
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                      {o.status === 'Placed' && <Button variant="ghost" size="sm" title="Accept" onClick={() => act(() => Api.accept(o.id), o.id, 'Order accepted')} disabled={rowBusy === o.id}><Check size={15} /></Button>}
                      {(o.status === 'Accepted' || o.status === 'Transferred') && <Button variant="ghost" size="sm" title="Mark delivered" onClick={() => act(() => Api.deliver(o.id), o.id, 'Order delivered')} disabled={rowBusy === o.id}><PackageCheck size={15} /></Button>}
                      <Button variant="ghost" size="sm" className="btn-icon" title="View" onClick={() => { setView(o); setTransferId('') }}><Eye size={15} /></Button>
                      <Button variant="ghost" size="sm" className="btn-icon" title="Delete" onClick={() => setDel(o)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
      </Card>

      {/* View / manage order */}
      <Modal open={!!view} onClose={() => setView(null)} size="lg" title={view ? `Order #${view.id}` : ''}
        footer={view && <>
          <Button variant="danger" icon={Trash2} onClick={() => setDel(view)}>Delete</Button>
          <div className="spacer" />
          {view.status === 'Placed' && <Button variant="primary" icon={Check} onClick={() => act(() => Api.accept(view.id), view.id, 'Order accepted')} disabled={rowBusy === view.id}>Accept</Button>}
          {(view.status === 'Accepted' || view.status === 'Transferred') && <Button variant="primary" icon={PackageCheck} onClick={() => act(() => Api.deliver(view.id), view.id, 'Order delivered')} disabled={rowBusy === view.id}>Mark delivered</Button>}
        </>}
      >
        {view && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="kpi-inline">
              <div><div className="faint" style={{ fontSize: 12 }}>Status</div><div style={{ marginTop: 4 }}><StatusBadge status={view.status} /></div></div>
              <div><div className="faint" style={{ fontSize: 12 }}>Customer</div><div style={{ fontWeight: 600 }}>{view.customerid || '—'}</div></div>
              <div><div className="faint" style={{ fontSize: 12 }}>Placed</div><div style={{ fontWeight: 600 }}>{dtTime(view.orderDate)}</div></div>
              <div><div className="faint" style={{ fontSize: 12 }}>Total</div><div style={{ fontWeight: 700 }}>{money(view.totalAmount)}</div></div>
            </div>
            {view.deliveryboyid && <div className="faint" style={{ fontSize: 13 }}>Delivery: <strong style={{ color: 'var(--text)' }}>{view.deliveryboyid}</strong></div>}
            {view.notes && <div className="card-body" style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 12, fontSize: 13 }}>{view.notes}</div>}

            <div>
              <div className="faint" style={{ fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>Line items</div>
              {view.items?.length ? (
                <Table columns={[{ label: 'Product' }, { label: 'Qty', num: true }, { label: 'Unit', num: true }, { label: 'Total', num: true }]}>
                  {view.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.productName || `#${it.productId}`}</td>
                      <td className="num mono">{num(it.quantity)}</td>
                      <td className="num mono">{money(it.unitPrice)}</td>
                      <td className="num mono">{money(it.totalPrice ?? it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </Table>
              ) : <p className="faint" style={{ fontSize: 13 }}>No line items recorded.</p>}
            </div>

            {(view.status === 'Accepted' || view.status === 'Placed') && (
              <div>
                <div className="field"><label>Assign delivery person</label></div>
                <div className="row" style={{ gap: 8 }}>
                  <Input placeholder="Delivery person ID" value={transferId} onChange={(e) => setTransferId(e.target.value)} />
                  <Button icon={Truck} onClick={doTransfer} disabled={rowBusy === view.id}>Transfer</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create order */}
      <Modal open={open} onClose={() => setOpen(false)} size="lg" title="New order"
        footer={<>
          <Button onClick={() => setOpen(false)} disabled={creating}>Cancel</Button>
          <Button variant="primary" onClick={placeOrder} disabled={creating}>{creating ? 'Placing…' : `Place order · ${money(formTotal)}`}</Button>
        </>}
      >
        <form onSubmit={placeOrder}>
          <div className="form-grid">
            <Field label="Customer ID"><Input autoFocus value={form.customerid} onChange={(e) => setForm({ ...form, customerid: e.target.value })} required /></Field>
            <Field label="Notes"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>

          <div className="field"><label>Items</label></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.lines.map((l, i) => (
              <div className="row" key={i} style={{ gap: 8 }}>
                <Select value={l.productId} onChange={(e) => setLine(i, { productId: e.target.value })} style={{ flex: 1 }}>
                  <option value="">Select product…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {money(p.price)}</option>)}
                </Select>
                <Input type="number" min="1" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} style={{ width: 90 }} />
                <span className="mono faint" style={{ width: 90, textAlign: 'right', fontSize: 13 }}>{money(lineTotal(l))}</span>
                <Button variant="ghost" size="sm" className="btn-icon" type="button" onClick={() => rmLine(i)} disabled={form.lines.length === 1} style={{ color: 'var(--danger)' }}><X size={15} /></Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" icon={Plus} type="button" onClick={addLine} style={{ marginTop: 8 }}>Add item</Button>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12, fontSize: 15, fontWeight: 700 }}>
            Total: <span style={{ marginLeft: 8 }}>{money(formTotal)}</span>
          </div>
          <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>Placing an order automatically reduces inventory stock for each item.</p>
        </form>
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} busy={busyDel} title="Delete order" message={`Delete order #${del?.id}? This cannot be undone.`} />
    </>
  )
}
