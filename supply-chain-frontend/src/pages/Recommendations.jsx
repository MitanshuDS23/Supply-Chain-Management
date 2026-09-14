import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Recommendations as Api, Inventory as InvApi, errMsg, msgOf } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import { Button, Card, Table, Loading, EmptyState, Badge, StatusBadge, num } from '../components/ui.jsx'

export default function Recommendations() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [percent, setPercent] = useState(20)
  const [rowBusy, setRowBusy] = useState(null)

  const load = async (p = percent) => {
    setLoading(true)
    try {
      const data = p === 20 ? await Api.all() : await Api.threshold(p)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) { toast.error('Failed to load recommendations', errMsg(e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load(20) }, [])

  const applyThreshold = () => load(percent)

  const restock = async (r) => {
    const qty = r.recommendedQuantity
    if (!qty || qty <= 0) return toast.info('Nothing to restock')
    setRowBusy(r.productId)
    try {
      const res = await InvApi.restock(r.productId, qty)
      const msg = msgOf(res)
      if (/exceeds|not found|insufficient/i.test(msg)) toast.error('Could not restock', msg)
      else { toast.success('Restocked', msg); load(percent) }
    } catch (e) { toast.error('Restock failed', errMsg(e)) }
    finally { setRowBusy(null) }
  }

  const critical = items.filter((i) => i.urgencyLevel === 'CRITICAL').length
  const high = items.filter((i) => i.urgencyLevel === 'HIGH').length

  return (
    <>
      <div className="page-head">
        <div><h2>Stock Recommendations</h2><p>AI-driven restock suggestions based on stock levels and consumption</p></div>
        <Button icon={RefreshCw} onClick={() => load(percent)}>Refresh</Button>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-icon" style={{ background: 'var(--danger-soft)' }}><AlertTriangle size={20} color="var(--danger)" /></div>
          <div className="stat-label">Critical</div><div className="stat-value">{critical}</div>
          <div className="stat-foot">Below 10% of reorder level</div>
        </div>
        <div className="stat">
          <div className="stat-icon" style={{ background: 'var(--warning-soft)' }}><TrendingUp size={20} color="var(--warning)" /></div>
          <div className="stat-label">High priority</div><div className="stat-value">{high}</div>
          <div className="stat-foot">Below 20% of reorder level</div>
        </div>
        <div className="stat">
          <div className="stat-icon" style={{ background: 'var(--primary-soft)' }}><Sparkles size={20} color="var(--primary)" /></div>
          <div className="stat-label">Total suggestions</div><div className="stat-value">{items.length}</div>
          <div className="stat-foot">At {percent}% threshold</div>
        </div>
      </div>

      <Card title="Restock suggestions" actions={
        <div className="row" style={{ gap: 10 }}>
          <span className="faint" style={{ fontSize: 12.5 }}>Threshold</span>
          <input type="range" min="5" max="100" step="5" value={percent} onChange={(e) => setPercent(Number(e.target.value))} onMouseUp={applyThreshold} onTouchEnd={applyThreshold} style={{ width: 120 }} />
          <Badge tone="primary">{percent}%</Badge>
        </div>
      } noBody>
        {loading ? <Loading label="Analyzing stock…" />
          : items.length === 0 ? <EmptyState icon={CheckCircle2} title="All good!" message="No products need restocking at this threshold." />
          : (
            <Table columns={[
              { label: 'Product' }, { label: 'Current', num: true }, { label: 'Reorder', num: true },
              { label: 'Recommend', num: true }, { label: 'Urgency' }, { label: 'Days left', num: true },
              { label: 'Supplier' }, { label: '', width: 110 },
            ]}>
              {items.map((r) => (
                <tr key={r.productId}>
                  <td><div className="cell-strong">{r.productName || `#${r.productId}`}</div><div className="cell-sub">#{r.productId}</div></td>
                  <td className="num mono">{num(r.currentStock)}</td>
                  <td className="num mono">{num(r.reorderLevel)}</td>
                  <td className="num mono cell-strong" style={{ color: 'var(--primary)' }}>+{num(r.recommendedQuantity)}</td>
                  <td><StatusBadge status={r.urgencyLevel} /></td>
                  <td className="num mono">{r.daysUntilStockout >= 999 ? '∞' : num(r.daysUntilStockout)}</td>
                  <td>{r.supplierName || <span className="faint">—</span>}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => restock(r)} disabled={rowBusy === r.productId}>
                      {rowBusy === r.productId ? '…' : 'Restock'}
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
      </Card>
    </>
  )
}
