import React, { useEffect, useState } from 'react';
// import{SERVER_URL} from  '../../../config/config.js';
const SERVER_URL = 'http://localhost:3000'; // Fallback for local development
const API_BASE = `${SERVER_URL}/admin/assistant`;

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list`);
      const data = await res.json();
      setAssistants(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load assistants');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleCreate = async () => {
    const name = prompt('Name:');
    if (!name) return;
    const description = prompt('Description:');
    const instructions = prompt('Instructions:');
    const model = prompt('Model (gpt-3.5-turbo or gpt-4):', 'gpt-3.5-turbo');
    try {
      await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, instructions, model }),
      });
      fetchAssistants();
    } catch (err) {
      console.error(err);
      alert('Failed to create assistant');
    }
  };

  const handleUpdate = async (assistant) => {
    const name = prompt('Name:', assistant.name);
    if (!name) return;
    const description = prompt('Description:', assistant.description);
    const instructions = prompt('Instructions:', assistant.instructions);
    const model = prompt('Model (gpt-3.5-turbo or gpt-4):', assistant.model);
    try {
      await fetch(`${API_BASE}/update/${assistant._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, instructions, model }),
      });
      fetchAssistants();
    } catch (err) {
      console.error(err);
      alert('Failed to update assistant');
    }
  };

  const handleDelete = async (assistant) => {
    if (!confirm(`Delete ${assistant.name}?`)) return;
    try {
      await fetch(`${API_BASE}/delete/${assistant._id}`, { method: 'POST' });
      fetchAssistants();
    } catch (err) {
      console.error(err);
      alert('Failed to delete assistant');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Assistant Management</h1>
      <button onClick={handleCreate} disabled={loading}>Create Assistant</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="5" cellSpacing="0" style={{ marginTop: 20, width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Model</th>
              <th>Description</th>
              <th>Instructions</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assistants.map((a) => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.model}</td>
                <td>{a.description}</td>
                <td>{a.instructions}</td>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>{new Date(a.updatedAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleUpdate(a)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(a)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
