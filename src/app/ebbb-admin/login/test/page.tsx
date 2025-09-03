export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '20px',
      fontSize: '24px'
    }}>
      <h1>TEST PAGE WORKS!</h1>
      <p>If you can see this, basic routing is working.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  )
} 