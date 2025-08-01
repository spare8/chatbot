// pages/index.js
export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Chatbot Management</h1>
      <p>
        • Frontend: Next.js<br/>
        • Backend: Express + MongoDB
      </p>
      <p>Try your API: <a href="http://localhost:3000/api/health" target="_blank">/api/health</a></p>
    </div>
  );
}
