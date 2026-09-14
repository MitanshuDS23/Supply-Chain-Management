import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Warehouse, ShoppingCart, Truck, TrendingUp, AlertTriangle, ArrowRight, IndianRupee,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Products, Suppliers, Inventory, Orders, Recommendations, errMsg } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import { Card, Table, Loading, Badge, StatusBadge, EmptyState, money, num, dtTime } from '../components/ui.jsx'

const PALETTE = ['#4f46e5', '#0ea5e9', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#14b8a6']
const STATUS_COLOR = { Placed: '#0ea5e9', Accepted: '#4f46e5', Transferred: '#f59e0b', Delivered: '#16a34a', Cancelled: '#dc2626' }

function Stat({ icon: Icon, tint, label, value, foot }) {
  return (
    <div className="stat">
      <div className="stat-icon" style={{ background: tint.bg }}><Icon size={20} color={tint.fg} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {foot && <div className="stat-foot">{foot}</div>}
    </div>
  )
}

export default function Dashboard() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ products: [], suppliers: [], inventory: [], orders: [], recos: [] })

  useEffect(() => {
    (async () => {
      setLoading(true)
      const [p, s, inv, o, r] = await Promise.allSettled([
        Products.list(0, 500), Suppliers.list(), Inventory.list(), Orders.list(0, 500), Recommendations.all(),
      ])
      if (p.status === 'rejected') toast.error('Some data failed to load', errMsg(p.reason))
      setData({
        products: p.status === 'fulfilled' ? p.value.items : [],
        suppliers: s.status === 'fulfilled' && Array.isArray(s.value) ? s.value : [],
        inventory: inv.status === 'fulfilled' && Array.isArray(inv.value) ? inv.value : [],
        orders: o.status === 'fulfilled' ? o.value.items : [],
        recos: r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [],
      })
      setLoading(false)
    })()
  }, [])

  const { products, suppliers, inventory, orders, recos } = data
  const revenue = useMemo(() => orders.reduce((s, o) => s + (o.totalAmount || 0), 0), [orders])
  const lowStock = useMemo(() => inventory.filter((i) => (i.currentStock ?? 0) < (i.reorderLevel ?? 0)), [inventory])

  const ordersByStatus = useMemo(() => {
    const m = {}
    orders.forEach((o) => { m[o.status || 'Unknown'] = (m[o.status || 'Unknown'] || 0) + 1 })
    return Object.entries(m).map(([status, count]) => ({ status, count }))
  }, [orders])

  const byCategory = useMemo(() => {
    const m = {}
    products.forEach((p) => { const c = p.category || 'Uncategorized'; m[c] = (m[c] || 0) + 1 })
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [products])

  const recentOrders = useMemo(() => [...orders].sort((a, b) => b.id - a.id).slice(0, 6), [orders])

  if (loading) return <Loading label="Loading dashboard…" />

  return (
    <>
      <div className="stat-grid">
        <Stat icon={Package} tint={{ bg: 'var(--primary-soft)', fg: 'var(--primary)' }} label="Products" value={num(products.length)} foot={`${suppliers.length} suppliers`} />
        <Stat icon={Warehouse} tint={{ bg: 'var(--info-soft)', fg: 'var(--info)' }} label="Inventory items" value={num(inventory.length)} foot={`${lowStock.length} low on stock`} />
        <Stat icon={ShoppingCart} tint={{ bg: 'var(--success-soft)', fg: 'var(--success)' }} label="Orders" value={num(orders.length)} foot={`${ordersByStatus.find((x) => x.status === 'Delivered')?.count || 0} delivered`} />
        <Stat icon={IndianRupee} tint={{ bg: 'var(--warning-soft)', fg: 'var(--warning)' }} label="Order value" value={money(revenue)} foot="across all orders" />
      </div>

      <div className="chart-grid">
        <Card title="Orders by status">
          {ordersByStatus.length === 0 ? <EmptyState title="No orders yet" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ordersByStatus} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="status" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(79,70,229,.06)' }} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={54}>
                  {ordersByStatus.map((e, i) => <Cell key={i} fill={STATUS_COLOR[e.status] || PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Products by category">
          {byCategory.length === 0 ? <EmptyState title="No products" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={86} paddingAngle={2}>
                  {byCategory.map((e, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="chart-grid" style={{ marginTop: 16 }}>
        <Card title="Recent orders" actions={<Link to="/orders" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>} noBody>
          {recentOrders.length === 0 ? <EmptyState icon={ShoppingCart} title="No orders yet" /> : (
            <Table columns={[{ label: 'Order' }, { label: 'Customer' }, { label: 'Total', num: true }, { label: 'Status' }, { label: 'Date' }]}>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="cell-strong">#{o.id}</td>
                  <td>{o.customerid || '—'}</td>
                  <td className="num mono">{money(o.totalAmount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="faint" style={{ fontSize: 12.5 }}>{dtTime(o.orderDate)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card
          title={<div className="row" style={{ gap: 8 }}><AlertTriangle size={16} color="var(--danger)" /><h3>Low stock alerts</h3></div>}
          actions={<Link to="/recommendations" className="btn btn-ghost btn-sm">Recommendations <ArrowRight size={14} /></Link>}
          noBody
        >
          {lowStock.length === 0 ? <EmptyState icon={TrendingUp} title="Stock levels healthy" message="No items are below their reorder level." />
            : (
              <div style={{ padding: '6px 0' }}>
                {lowStock.slice(0, 7).map((i) => (
                  <div key={i.productId} className="row" style={{ justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div className="cell-strong">{i.productName || `#${i.productId}`}</div>
                      <div className="cell-sub">Reorder at {num(i.reorderLevel)}</div>
                    </div>
                    <Badge tone="danger" dot>{num(i.currentStock)} left</Badge>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>
    </>
  )
}
