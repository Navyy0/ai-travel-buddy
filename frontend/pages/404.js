export default function NotFound() {
  return (
    <div style={{minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
      <div style={{textAlign:'center'}}>
        <h1>404 — Page not found</h1>
        <p>The page you're looking for does not exist.</p>
        <a href="/" style={{color:'#2563eb'}}>Go back home</a>
      </div>
    </div>
  )
}
