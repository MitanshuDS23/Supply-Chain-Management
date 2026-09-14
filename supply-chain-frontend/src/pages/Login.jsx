import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, ShieldCheck, Zap, BarChart3, LogIn, UserPlus } from 'lucide-react'
import { Auth, errMsg } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { Field, Input, Select, Button } from '../components/ui.jsx'

export default function Login() {
  const [tab, setTab] = useState('signin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [signin, setSignin] = useState({ email: '', password: '' })
  const [signup, setSignup] = useState({ id: '', fullName: '', email: '', password: '', type: 'staff' })
  const { login } = useAuth()
  const toast = useToast()
  const nav = useNavigate()

  const doSignin = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const res = await Auth.login(signin.email.trim(), signin.password)
      login(res.user || { id: signin.email })
      toast.success('Welcome back', res.user?.fullName ? `Signed in as ${res.user.fullName}` : 'Signed in')
      nav('/')
    } catch (err) {
      setError(errMsg(err))
    } finally { setBusy(false) }
  }

  const doSignup = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const res = await Auth.signup({ ...signup, id: signup.id.trim(), email: signup.email.trim() })
      toast.success('Account created', 'You can now sign in')
      login(res.user || { id: signup.id, fullName: signup.fullName, type: signup.type })
      nav('/')
    } catch (err) {
      setError(errMsg(err))
    } finally { setBusy(false) }
  }

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div className="glow" />
        <div className="row" style={{ gap: 12, position: 'relative' }}>
          <div className="logo" style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.15)', display: 'grid', placeItems: 'center' }}><Boxes size={22} /></div>
          <strong style={{ fontSize: 18 }}>SupplyChain</strong>
        </div>
        <div style={{ position: 'relative' }}>
          <h1>Run your supermarket supply chain from one console.</h1>
          <p>Products, inventory, orders and AI-powered restock recommendations — unified across six microservices.</p>
        </div>
        <div className="login-feat" style={{ position: 'relative' }}>
          <div><span className="fi"><Zap size={16} /></span> Real-time inventory & order sync</div>
          <div><span className="fi"><BarChart3 size={16} /></span> Dashboards and stock analytics</div>
          <div><span className="fi"><ShieldCheck size={16} /></span> Role-based user management</div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="lc-brand"><div className="logo" style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'grid', placeItems: 'center', color: '#fff' }}><Boxes size={17} /></div> SupplyChain</div>
          <div className="tabs">
            <button className={tab === 'signin' ? 'active' : ''} onClick={() => { setTab('signin'); setError('') }}>Sign in</button>
            <button className={tab === 'signup' ? 'active' : ''} onClick={() => { setTab('signup'); setError('') }}>Sign up</button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {tab === 'signin' ? (
            <form onSubmit={doSignin}>
              <Field label="Email or username">
                <Input autoFocus placeholder="you@example.com" value={signin.email} onChange={(e) => setSignin({ ...signin, email: e.target.value })} required />
              </Field>
              <Field label="Password">
                <Input type="password" placeholder="••••••••" value={signin.password} onChange={(e) => setSignin({ ...signin, password: e.target.value })} required />
              </Field>
              <Button variant="primary" type="submit" icon={LogIn} disabled={busy} className="full" style={{ width: '100%', marginTop: 6 }}>{busy ? 'Signing in…' : 'Sign in'}</Button>
            </form>
          ) : (
            <form onSubmit={doSignup}>
              <div className="form-grid">
                <Field label="Username"><Input placeholder="jdoe" value={signup.id} onChange={(e) => setSignup({ ...signup, id: e.target.value })} required /></Field>
                <Field label="Full name"><Input placeholder="Jane Doe" value={signup.fullName} onChange={(e) => setSignup({ ...signup, fullName: e.target.value })} /></Field>
              </div>
              <Field label="Email"><Input type="email" placeholder="you@example.com" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} required /></Field>
              <div className="form-grid">
                <Field label="Password" hint="min 6 chars"><Input type="password" placeholder="••••••••" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required /></Field>
                <Field label="Role">
                  <Select value={signup.type} onChange={(e) => setSignup({ ...signup, type: e.target.value })}>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Select>
                </Field>
              </div>
              <Button variant="primary" type="submit" icon={UserPlus} disabled={busy} style={{ width: '100%', marginTop: 6 }}>{busy ? 'Creating…' : 'Create account'}</Button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
