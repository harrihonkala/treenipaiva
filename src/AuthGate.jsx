import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const styles = {
  page: { minHeight:'100vh', background:'#0D0D0D', color:'#F2F2F7', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'Inter, sans-serif' },
  card: { width:'100%', maxWidth:380, background:'#1E1E24', border:'1px solid #2C2C35', borderRadius:20, padding:24 },
  title: { fontFamily:'Poppins, sans-serif', fontSize:24, fontWeight:700, marginBottom:6 },
  sub: { color:'#8E8E9A', fontSize:13, lineHeight:1.5, marginBottom:22 },
  label: { display:'block', color:'#8E8E9A', fontSize:11, marginBottom:6 },
  input: { width:'100%', background:'#161616', color:'#F2F2F7', border:'1px solid #2C2C35', borderRadius:12, padding:'13px 14px', fontSize:14, outline:'none', marginBottom:12 },
  primary: { width:'100%', border:0, borderRadius:12, padding:'14px 16px', background:'linear-gradient(135deg,#00C9A7 0%,#00A896 100%)', color:'#000', fontWeight:700, cursor:'pointer', marginTop:4 },
  secondary: { width:'100%', border:'1px solid #2C2C35', borderRadius:12, padding:'12px 16px', background:'transparent', color:'#8E8E9A', fontWeight:600, cursor:'pointer', marginTop:10 },
  error: { background:'rgba(255,69,58,.1)', border:'1px solid rgba(255,69,58,.25)', color:'#FF8A84', borderRadius:10, padding:10, fontSize:12, marginBottom:12 },
  success: { background:'rgba(0,201,167,.1)', border:'1px solid rgba(0,201,167,.25)', color:'#00C9A7', borderRadius:10, padding:10, fontSize:12, marginBottom:12 },
};

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError(''); setMessage('');
    if (!email.trim() || !password) { setError('Anna sähköpostiosoite ja salasana.'); return; }
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email:email.trim(), password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email:email.trim(), password,
          options:{ data:name.trim() ? { name:name.trim() } : undefined },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage('Tunnus luotiin. Tarkista sähköpostisi ja vahvista osoite ennen kirjautumista.');
          setMode('login');
        } else setMessage('Tunnus luotiin onnistuneesti.');
      }
    } catch (err) {
      setError(err?.message || 'Kirjautuminen epäonnistui.');
    } finally { setBusy(false); }
  };

  const logout = async () => { await supabase.auth.signOut(); };

  if (loading) return <div style={styles.page}><div style={{color:'#8E8E9A'}}>Ladataan...</div></div>;

  if (!isSupabaseConfigured) return (
    <div style={styles.page}><div style={styles.card}>
      <div style={styles.title}>Treenipäiväkirja</div>
      <div style={styles.sub}>Supabase-yhteyttä ei ole vielä määritetty.</div>
      <div style={styles.error}>Aseta VITE_SUPABASE_URL ja VITE_SUPABASE_PUBLISHABLE_KEY ympäristömuuttujiin.</div>
    </div></div>
  );

  if (!session) return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={submit}>
        <div style={styles.title}>Treenipäiväkirja</div>
        <div style={styles.sub}>{mode==='login' ? 'Kirjaudu sisään jatkaaksesi.' : 'Luo oma käyttäjätili Treenipäiväkirjaan.'}</div>
        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}
        {mode==='signup' && <><label style={styles.label}>Nimi</label><input style={styles.input} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" /></>}
        <label style={styles.label}>Sähköposti</label>
        <input style={styles.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required />
        <label style={styles.label}>Salasana</label>
        <input style={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='login'?'current-password':'new-password'} minLength={6} required />
        <button style={styles.primary} disabled={busy} type="submit">{busy?'Odota...':mode==='login'?'Kirjaudu':'Luo käyttäjätili'}</button>
        <button type="button" style={styles.secondary} onClick={()=>{setError('');setMessage('');setMode(m=>m==='login'?'signup':'login');}}>
          {mode==='login'?'Luo uusi käyttäjätili':'Minulla on jo käyttäjätili'}
        </button>
      </form>
    </div>
  );

  // Temporary development-only logout control. Move this into Settings later.
  return <>
    {children}
    <button type="button" onClick={logout} title={`Kirjaudu ulos (${session.user.email || 'käyttäjä'})`} style={{position:'fixed',top:10,right:10,zIndex:1000,border:'1px solid #2C2C35',borderRadius:9,padding:'6px 9px',background:'rgba(22,22,22,.9)',color:'#8E8E9A',fontSize:10,cursor:'pointer'}}>Ulos</button>
  </>;
}
