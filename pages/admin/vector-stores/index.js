import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/vectorStore';

export default function VectorStorePage() {
  const [vectorStores, setVectorStores] = useState([]);
  const [showFiles, setShowFiles] = useState({});
  const [fileInputs, setFileInputs] = useState({});
  const [newVS, setNewVS] = useState({ name: '', description: '', maxChunkSize: 300, maxChunkOverlap: 40 });

  const fetchVectorStores = async () => {
    const res = await axios.get(`${API_BASE}/list`);
    setVectorStores(res.data);
  };

  useEffect(() => {
    fetchVectorStores();
  }, []);

  const handleToggleFiles = (vsId) => {
    setShowFiles((prev) => ({ ...prev, [vsId]: !prev[vsId] }));
  };

  const handleCreateVS = async () => {
    try {
      await fetch(`${API_BASE}/create`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(newVS),
      });
      // await axios.post(`${API_BASE}/create`, newVS);
      setNewVS({ name: '', description: '', maxChunkSize: 300, maxChunkOverlap: 40 });
      fetchVectorStores();
    } catch (err) {
      alert('Failed to create vector store');
    }
  };

  const handleFileUpload = async (vsId) => {
    const file = fileInputs[vsId];
    if (!file) return alert('No file selected');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('vectorStoreId', vsId);
    try {
      await axios.post(`${API_BASE}/createFile`, formData);
      alert('File uploaded');
      fetchVectorStores();
    } catch (err) {
      alert('File upload failed');
    }
  };

  const handleDeleteVS = async (vsId) => {
    if (!confirm('Delete this vector store?')) return;
    await fetch(`${API_BASE}/delete`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ vectorStoreId: vsId }),
    });
    fetchVectorStores();
  };

  const handleDeleteFile = async (vsId, fileId) => {
    await axios.post(`${API_BASE}/deleteFile`, { vectorStoreId: vsId, fileId });
    fetchVectorStores();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>📦 Vector Store Manager</h2>

      <div style={{ marginBottom: 24 }}>
        <h3>Create New Vector Store</h3>
        <input placeholder="Name" value={newVS.name} onChange={(e) => setNewVS({ ...newVS, name: e.target.value })} />
        <input placeholder="Description" value={newVS.description} onChange={(e) => setNewVS({ ...newVS, description: e.target.value })} />
        <input type="number" placeholder="Chunk Size" value={newVS.maxChunkSize} onChange={(e) => setNewVS({ ...newVS, maxChunkSize: Number(e.target.value) })} />
        <input type="number" placeholder="Chunk Overlap" value={newVS.maxChunkOverlap} onChange={(e) => setNewVS({ ...newVS, maxChunkOverlap: Number(e.target.value) })} />
        <button onClick={handleCreateVS}>Create</button>
      </div>

      <h3>📁 Existing Vector Stores</h3>
      {vectorStores.map((vs) => (
        <div key={vs.openaiId} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
          <strong>{vs.name}</strong> — {vs.description}
          <div>ID: {vs.openaiId}</div>
          <div>Chunk Size: {vs.maxChunkSize}, Overlap: {vs.maxChunkOverlap}</div>
          <button onClick={() => handleToggleFiles(vs.openaiId)}>📂 {showFiles[vs.openaiId] ? 'Hide Files' : 'Show Files'}</button>
          <button onClick={() => handleDeleteVS(vs.openaiId)} style={{ marginLeft: 8 }}>🗑 Delete Vector Store</button>

          {showFiles[vs.openaiId] && (
            <div style={{ marginTop: 12, paddingLeft: 20 }}>
              {vs.files?.length > 0 ? (
                vs.files.map((file) => (
                  <div key={file.openaiId} style={{ marginBottom: 4 }}>
                    📄 {file.fileName} — {file.size} bytes — Last Updated: {new Date(file.updatedAt).toLocaleString()}
                    <button onClick={() => handleDeleteFile(vs.openaiId, file.openaiId)} style={{ marginLeft: 8 }}>🗑</button>
                  </div>
                ))
              ) : (
                <div>No files</div>
              )}

              <input type="file" onChange={(e) => setFileInputs({ ...fileInputs, [vs.openaiId]: e.target.files[0] })} />
              <button onClick={() => handleFileUpload(vs.openaiId)}>Upload</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
