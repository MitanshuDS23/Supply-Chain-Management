import { useEffect, useMemo, useState } from 'react'
import { Search, Warehouse, Settings2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Inventory as Api, errMsg, msgOf } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import {
  Button, Card, Table, Modal, Field, Input, Select,
  Loading, EmptyState, Badge, num, dtTime,
} from '../components/ui.jsx'

function StockBar({ cur, max, low }) {
  const pct = max ? Math.min(100, Math.round((cur / max) * 100)) : 0
  const color = low ? 'var(--danger)' : pct < 40 ? 'var(--warning)' : 'var(--success)'
  return (
    <div style={{ minWidth: 130 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="mono cell-strong">{num(cur)}</span>
        <span className="faint mono" style={{ fontSize: 11.5 }}>/ {num(max)}</span>
      </div>
      <div className="progress"><span style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  )
}

export default function Inventory() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)
  const [manage, setManage] = useState(null)
  const [adj, setAdj] = useState({ mode: 'restock', qty: '' })
  const [reorder, setReorder] = useState('')
  const [consumption, setConsumption] = useState('')
  const [busy, setBusy] = useState('')

  const load = async () => {
    setLoading(true)
    try { setItems(await Api.list()) }
    catch (e) { toast.error('Failed to load inventory', errMsg(e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const isLow = (i) => (i.currentStock ?? 0) < (i.reorderLevel ?? 0)
  const filtered = useMemo(() => items.filter((i) => {
    const okQ = !q || `${i.productName} ${i.productId} ${i.location}`.toLowerCase().includes(q.toLowerCase())
    return okQ && (!onlyLow || isLow(i))
  }), [items, q, onlyLow])
  const lowCount = useMemo(() => items.filter(isLow).length, [items])

  const openManage = (i) => {
    setManage(i); setAdj({ mode: 'restock', qty: '' })
    setReorder(i.reorderLevel ?? ''); setConsumption(i.averageDailyConsumption ?? '')
  }

  const applyAdjust = async () => {
    const qty = Number(adj.qty)
    if (!qty || qty <= 0) return toast.error('Enter a quantity greater than 0')
    setBusy('adjust')
    try {
      const r = adj.mode === 'restock'
        ? await Api.restock(manage.productId, qty)
        : await Api.reduce(manage.productId, qty)
      const msg = msgOf(r)
      if (/insufficient|exceeds|not found/i.test(msg)) toast.error('Could not adjust', msg)
      else toast.success('Stock updated', msg)
      await refreshRow()
    } catch (e) { toast.error('Adjustment failed', errMsg(e)) }
    finally { setBusy('') }
  }

  const saveReorder = async () => {
    setBusy('reorder')
    try { const r = await Api.setReorder(manage.productId, Number(reorder)); toast.success('Reorder level updated', msgOf(r)); await refreshRow() }
    catch (e) { toast.error('Update failed', errMsg(e)) } finally { setBusy('') }
  }
  const saveConsumption = async () => {
    setBusy('consumption')
    try { const r = await Api.setConsumption(manage.productId, Number(consumption)); toast.success('Consumption updated', msgOf(r)); await refreshRow() }
    catch (e) { toast.error('Update failed', errMsg(e)) } finally { setBusy('') }
  }

  const refreshRow = async () => {
    try {
      const fresh = await Api.get(manage.productId)
      setItems((list) => list.map((x) => (x.productId === fresh.productId ? fresh : x)))
      setManage(fresh); setAdj({ mode: 'restock', qty: '' })
    } catch { load() }
  }

  return (
    <>
      <div className="page-head">
        <div><h2>Inventory</h2><p>{num(items.length)} tracked items · {lowCount} low on stock</p></div>
      </div>

      <div className="toolbar">
        <div className="search"><Search size={16} /><input placeholder="Search by product or location…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Button variant={onlyLow ? 'primary' : 'default'} icon={AlertTriangle} onClick={() => setOnlyLow((v) => !v)}>
          Low stock {lowCount ? `(${lowCount})` : ''}
        </Button>
      </div>

      <Card noBody>
        {loading ? <Loading label="Loading inventory…" />
          : filtered.length === 0 ? <EmptyState icon={Warehouse} title="No inventory records" message={onlyLow ? 'No items are below their reorder level.' : 'Inventory is created automatically when you add products.'} />
          : (
            <Table columns={[
              { label: 'Product' }, { label: 'Stock level' }, { label: 'Reorder', num: true },
              { label: 'Location' }, { label: 'Status' }, { label: 'Last restocked' }, { label: '', width: 60 },
            ]}>
              {filtered.map((i) => (
                <tr key={i.productId}>
                  <td><div className="cell-strong">{i.productName || `Product #${i.productId}`}</div><div className="cell-sub">#{i.productId}</div></td>
                  <td><StockBar cur={i.currentStock} max={i.maxCapacity} low={isLow(i)} /></td>
                  <td className="num mono">{num(i.reorderLevel)}</td>
                  <td>{i.location || <span className="faint">—</span>}</td>
                  <td>{isLow(i) ? <Badge tone="danger" dot>Low stock</Badge> : <Badge tone="success" dot>In stock</Badge>}</td>
                  <td className="faint" style={{ fontSize: 12.5 }}>{dtTime(i.lastRestocked)}</td>
                  <td>
                    <Button variant="ghost" size="sm" className="btn-icon" title="Manage" onClick={() => openManage(i)}><Settings2 size={16} /></Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
      </Card>

      <Modal open={!!manage} onClose={() => setManage(null)} title={manage ? `Manage · ${manage.productName || '#' + manage.productId}` : ''}>
        {manage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="kpi-inline">
              <div><div className="faint" style={{ fontSize: 12 }}>Current stock</div><div style={{ fontSize: 20, fontWeight: 700 }}>{num(manage.currentStock)}</div></div>
              <div><div className="faint" style={{ fontSize: 12 }}>Reorder level</div><div style={{ fontSize: 20, fontWeight: 700 }}>{num(manage.reorderLevel)}</div></div>
              <div><div className="faint" style={{ fontSize: 12 }}>Max capacity</div><div style={{ fontSize: 20, fontWeight: 700 }}>{num(manage.maxCapacity)}</div></div>
            </div>

            <div>
              <div className="field"><label>Adjust stock</label></div>
              <div className="row" style={{ gap: 8 }}>
                <Select value={adj.mode} onChange={(e) => setAdj({ ...adj, mode: e.target.value })} style={{ maxWidth: 140 }}>
                  <option value="restock">Restock (+)</option>
                  <option value="reduce">Reduce (−)</option>
                </Select>
                <Input type="number" min="1" placeholder="Quantity" value={adj.qty} onChange={(e) => setAdj({ ...adj, qty: e.target.value })} style={{ flex: 1 }} />
                <Button variant="primary" icon={adj.mode === 'restock' ? TrendingUp : TrendingDown} onClick={applyAdjust} disabled={busy === 'adjust'}>Apply</Button>
              </div>
            </div>

            <div className="two-col">
              <div>
                <div className="field"><label>Reorder level</label></div>
                <div className="row" style={{ gap: 8 }}>
                  <Input type="number" min="0" value={reorder} onChange={(e) => setReorder(e.target.value)} />
                  <Button onClick={saveReorder} disabled={busy === 'reorder'}>Save</Button>
                </div>
              </div>
              <div>
                <div className="field"><label>Avg daily use</label></div>
                <div className="row" style={{ gap: 8 }}>
                  <Input type="number" min="0" step="0.1" value={consumption} onChange={(e) => setConsumption(e.target.value)} />
                  <Button onClick={saveConsumption} disabled={busy === 'consumption'}>Save</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
