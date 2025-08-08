// pages/admin/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{padding: 20, textAlign: 'center'}}>
      <h1>Chatbot Management</h1>
      <div style={{marginTop: 20, display: 'flex', justifyContent: 'center', gap: '1rem'}}>
        <Link href="/admin/assistants">
          <button style={{padding: '0.5rem 1rem', fontSize: '1rem'}}>
            Manage Assistants
          </button>
        </Link>
        <Link href="/admin/vector-stores">
          <button style={{padding: '0.5rem 1rem', fontSize: '1rem'}}>
            Manage Vector Stores
          </button>
        </Link>
      </div>
    </div>
  );
}
