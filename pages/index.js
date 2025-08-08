// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{padding: 20, textAlign: 'center'}}>
      <h1>Chatbot Management</h1>
      <div style={{marginTop: 20, display: 'flex', justifyContent: 'center', gap: '1rem'}}>
        <Link href="/config">
          <button style={{padding: '0.5rem 1rem', fontSize: '1rem'}}>
            Chatbot Config
          </button>
        </Link>
        <Link href="/admin">
          <button style={{padding: '0.5rem 1rem', fontSize: '1rem'}}>
            Chatbot Admin
          </button>
        </Link>
        <Link href="/client">
          <button style={{padding: '0.5rem 1rem', fontSize: '1rem'}}>
            Chatbot Client
          </button>
        </Link>
      </div>
    </div>
  );
}
