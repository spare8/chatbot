  // // import React, { useEffect, useState } from 'react';
  // // const SERVER_URL = 'http://localhost:3000'; // Fallback for local development
  // // const API_BASE = `${SERVER_URL}/assistant`;

  // // export default function AssistantsPage() {
  // //   const [assistants, setAssistants] = useState([]);
  // //   const [loading, setLoading] = useState(false);

  // //   const fetchAssistants = async () => {
  // //     setLoading(true);
  // //     try {
  // //       const res = await fetch(`${API_BASE}/list`);
  // //       const data = await res.json();
  // //       setAssistants(data);
  // //     } catch (err) {
  // //       console.error(err);
  // //       alert('Failed to load assistants');
  // //     }
  // //     setLoading(false);
  // //   };

  // //   useEffect(() => {
  // //     fetchAssistants();
  // //   }, []);

  // //   const handleCreate = async () => {
  // //     const name = prompt('Name:');
  // //     if (!name) return;
  // //     const description = prompt('Description:');
  // //     const instructions = prompt('Instructions:');
  // //     const model = prompt('Model (gpt-3.5-turbo or gpt-4):', 'gpt-3.5-turbo');
  // //     try {
  // //       await fetch(`${API_BASE}/create`, {
  // //         method: 'POST',
  // //         headers: { 'Content-Type': 'application/json' },
  // //         body: JSON.stringify({ name, description, instructions, model }),
  // //       });
  // //       fetchAssistants();
  // //     } catch (err) {
  // //       console.error(err);
  // //       alert('Failed to create assistant');
  // //     }
  // //   };

  // //   const handleUpdate = async (assistant) => {
  // //     const name = prompt('Name:', assistant.name);
  // //     if (!name) return;
  // //     const description = prompt('Description:', assistant.description);
  // //     const instructions = prompt('Instructions:', assistant.instructions);
  // //     const model = prompt('Model (gpt-3.5-turbo or gpt-4):', assistant.model);
  // //     try {
  // //       await fetch(`${API_BASE}/update/${assistant._id}`, {
  // //         method: 'POST',
  // //         headers: { 'Content-Type': 'application/json' },
  // //         body: JSON.stringify({ name, description, instructions, model }),
  // //       });
  // //       fetchAssistants();
  // //     } catch (err) {
  // //       console.error(err);
  // //       alert('Failed to update assistant');
  // //     }
  // //   };

  // //   const handleDelete = async (assistant) => {
  // //     if (!confirm(`Delete ${assistant.name}?`)) return;
  // //     try {
  // //       await fetch(`${API_BASE}/delete/${assistant._id}`, { method: 'POST' });
  // //       fetchAssistants();
  // //     } catch (err) {
  // //       console.error(err);
  // //       alert('Failed to delete assistant');
  // //     }
  // //   };

  // //   return (
  // //     <div style={{ padding: 20 }}>
  // //       <h1>Assistant Management</h1>
  // //       <button onClick={handleCreate} disabled={loading}>Create Assistant</button>
  // //       {loading ? (
  // //         <p>Loading...</p>
  // //       ) : (
  // //         <table border="1" cellPadding="5" cellSpacing="0" style={{ marginTop: 20, width: '100%' }}>
  // //           <thead>
  // //             <tr>
  // //               <th>Name</th>
  // //               <th>Model</th>
  // //               <th>Description</th>
  // //               <th>Instructions</th>
  // //               <th>Created At</th>
  // //               <th>Updated At</th>
  // //               <th>Actions</th>
  // //             </tr>
  // //           </thead>
  // //           <tbody>
  // //             {assistants.map((a) => (
  // //               <tr key={a._id}>
  // //                 <td>{a.name}</td>
  // //                 <td>{a.model}</td>
  // //                 <td>{a.description}</td>
  // //                 <td>{a.instructions}</td>
  // //                 <td>{new Date(a.createdAt).toLocaleString()}</td>
  // //                 <td>{new Date(a.updatedAt).toLocaleString()}</td>
  // //                 <td>
  // //                   <button onClick={() => handleUpdate(a)}>Edit</button>{' '}
  // //                   <button onClick={() => handleDelete(a)}>Delete</button>
  // //                 </td>
  // //               </tr>
  // //             ))}
  // //           </tbody>
  // //         </table>
  // //       )}
  // //     </div>
  // //   );
  // // }
  // import React, { useEffect, useState } from 'react';

  // const SERVER_URL = 'http://localhost:3000'; // backend on 3000
  // const API_BASE   = `${SERVER_URL}/assistant`;

  // export default function AssistantsPage() {
  //   const [assistants, setAssistants] = useState([]);
  //   const [loading, setLoading] = useState(false);

  //   // Fetch list
  //   const fetchAssistants = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await fetch(`${API_BASE}/list`);
  //       const data = await res.json();
  //       setAssistants(data);
  //     } catch (err) {
  //       console.error(err);
  //       alert('Failed to load assistants');
  //     }
  //     setLoading(false);
  //   };

  //   useEffect(() => {
  //     fetchAssistants();
  //   }, []);

  //   // Create
  //   const handleCreate = async () => {
  //     const name = prompt('Name:');
  //     if (!name) return;
  //     const description = prompt('Description:');
  //     const instructions = prompt('Instructions:');
  //     if (!instructions) return;
  //     const model = prompt('Model (gpt-3.5-turbo or gpt-4):', 'gpt-3.5-turbo');
  //     if (!model) return;

  //     try {
  //       await fetch(`${API_BASE}/create`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ name, description, instructions, model }),
  //       });
  //       fetchAssistants();
  //     } catch (err) {
  //       console.error(err);
  //       alert('Failed to create assistant');
  //     }
  //   };

  //   // Update (body-only)
  //   const handleUpdate = async (assistant) => {
  //     const name = prompt('Name:', assistant.name);
  //     if (!name) return;
  //     const description = prompt('Description:', assistant.description);
  //     const instructions = prompt('Instructions:', assistant.instructions);
  //     if (!instructions) return;
  //     const model = prompt('Model (gpt-3.5-turbo or gpt-4):', assistant.model);
  //     if (!model) return;

  //     try {
  //       await fetch(`${API_BASE}/update`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           assistantId: assistant.openaiId,
  //           name,
  //           description,
  //           instructions,
  //           model,
  //         }),
  //       });
  //       fetchAssistants();
  //     } catch (err) {
  //       console.error(err);
  //       alert('Failed to update assistant');
  //     }
  //   };

  //   // Delete (body-only)
  //   const handleDelete = async (assistant) => {
  //     if (!confirm(`Delete ${assistant.name}?`)) return;

  //     try {
  //       await fetch(`${API_BASE}/delete`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ assistantId: assistant.openaiId }),
  //       });
  //       fetchAssistants();
  //     } catch (err) {
  //       console.error(err);
  //       alert('Failed to delete assistant');
  //     }
  //   };

  //   return (
  //     <div style={{ padding: 20 }}>
  //       <h1>Assistant Management</h1>
  //       <button onClick={handleCreate} disabled={loading}>
  //         Create Assistant
  //       </button>

  //       {loading ? (
  //         <p>Loading...</p>
  //       ) : (
  //         <table
  //           border="1"
  //           cellPadding="5"
  //           cellSpacing="0"
  //           style={{ marginTop: 20, width: '100%' }}
  //         >
  //           <thead>
  //             <tr>
  //               <th>Name</th>
  //               <th>Model</th>
  //               <th>Description</th>
  //               <th>Instructions</th>
  //               <th>Created At</th>
  //               <th>Updated At</th>
  //               <th>Actions</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {assistants.map((a) => (
  //               <tr key={a._id}>
  //                 <td>{a.name}</td>
  //                 <td>{a.model}</td>
  //                 <td>{a.description}</td>
  //                 <td>{a.instructions}</td>
  //                 <td>{new Date(a.createdAt).toLocaleString()}</td>
  //                 <td>{new Date(a.updatedAt).toLocaleString()}</td>
  //                 <td>
  //                   <button onClick={() => handleUpdate(a)}>Edit</button>{' '}
  //                   <button onClick={() => handleDelete(a)}>Delete</button>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       )}
  //     </div>
  //   );
  // }

  import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  ThemeProvider,
  createTheme,
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit,
  Delete,
  Remove,
  Add,
} from '@mui/icons-material';

const SERVER_URL     = 'http://localhost:3000';
const API_BASE       = `${SERVER_URL}/assistant`;
const ITEMS_PER_PAGE = 5;
const MODEL_OPTIONS  = ['gpt-3.5-turbo', 'gpt-4'];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#121212', paper: '#1d1d1d' },
    primary: { main: '#90caf9' },
  },
});

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);
  const [openEdit, setOpenEdit]       = useState(false);
  const [current, setCurrent]         = useState(null);
  const [openDelete, setOpenDelete]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]           = useState('');

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/list`);
      const data = await res.json();
      setAssistants(data);
    } catch {
      alert('Failed to load assistants');
    }
    setLoading(false);
  };
  useEffect(fetchAssistants, []);

  const handleCreate = () => {
    setCurrent({ model: MODEL_OPTIONS[0], temperature: 0.7 });
    setOpenEdit(true);
  };
  const handleEdit   = (a) => {
    setCurrent({ ...a });
    setOpenEdit(true);
  };
  const handleDeleteClick = (a) => {
    setDeleteTarget(a);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    await fetch(`${API_BASE}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistantId: deleteTarget.openaiId }),
    });
    setOpenDelete(false);
    setDeleteTarget(null);
    fetchAssistants();
  };

  const handleSave = async () => {
    const {
      openaiId, name, description, instructions, model, temperature,
    } = current;
    const url  = `${API_BASE}/${openaiId ? 'update' : 'create'}`;
    const body = openaiId
      ? { assistantId: openaiId, name, description, instructions, model, temperature }
      : { name, description, instructions, model, temperature };

    await fetch(url, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
    });
    setOpenEdit(false);
    fetchAssistants();
  };

  const onPageChange = (_, value) => setPage(value);

  const filtered = assistants.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged     = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Box>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={handleCreate}>
                <AddIcon />
              </IconButton>
              <Box
                sx={{
                  ml: 1,
                  px: 1,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SearchIcon sx={{ mr: 1 }} />
                <InputBase
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  sx={{ color: 'inherit' }}
                />
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="h6">Assistants</Typography>
            </Box>
            <Box sx={{ width: 48 }} />
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading…</Typography>
          ) : paged.length === 0 ? (
            <Typography>No assistants found.</Typography>
          ) : (
            <Box
              sx={{
                display       : 'flex',
                flexDirection : 'column',
                gap           : 2,
                alignItems    : 'center',
              }}
            >
              {paged.map((a) => (
                <Card key={a.openaiId} variant="outlined" sx={{ width: '50%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6">{a.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{ bgcolor: 'grey.800', p: 1, borderRadius: 1, mt: 1 }}
                    >
                      {a.model}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ bgcolor: 'grey.800', p: 1, borderRadius: 1, mt: 1 }}
                    >
                      {a.description}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ bgcolor: 'grey.800', p: 1, borderRadius: 1, mt: 1 }}
                    >
                      {a.instructions}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Temp: {a.temperature}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button startIcon={<Edit />} onClick={() => handleEdit(a)}>
                      Edit
                    </Button>
                    <Button
                      startIcon={<Delete />}
                      color="error"
                      onClick={() => handleDeleteClick(a)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={pageCount} page={page} onChange={onPageChange} color="primary" />
            </Box>
          )}
        </Box>

        {/* Edit/Create Dialog */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            {current?.openaiId ? 'Edit Assistant' : 'New Assistant'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Name"
              value={current?.name || ''}
              onChange={(e) => setCurrent((c) => ({ ...c, name: e.target.value }))}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                label="Model"
                value={current?.model || MODEL_OPTIONS[0]}
                onChange={(e) => setCurrent((c) => ({ ...c, model: e.target.value }))}
              >
                {MODEL_OPTIONS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={current?.description || ''}
              onChange={(e) => setCurrent((c) => ({ ...c, description: e.target.value }))}
              fullWidth
              multiline
            />

            <TextField
              label="Instructions"
              value={current?.instructions || ''}
              onChange={(e) => setCurrent((c) => ({ ...c, instructions: e.target.value }))}
              fullWidth
              multiline
            />

            <TextField
              label="Temperature"
              type="number"
              value={current?.temperature ?? ''}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, temperature: parseFloat(e.target.value) }))
              }
              InputProps={{
                step: 0.1,
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setCurrent((c) => ({
                          ...c,
                          temperature: Math.max(0, (c.temperature || 0) - 0.1),
                        }))
                      }
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setCurrent((c) => ({
                          ...c,
                          temperature: Math.min(2, (c.temperature || 0) + 0.1),
                        }))
                      }
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)} fullWidth maxWidth="xs">
          <DialogTitle>Delete Assistant?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this assistant?</Typography>
            {deleteTarget && (
              <List dense>
                <ListItem>
                  <ListItemText primary="Name" secondary={deleteTarget.name} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Model" secondary={deleteTarget.model} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Description" secondary={deleteTarget.description} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Instructions" secondary={deleteTarget.instructions} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Temp" secondary={deleteTarget.temperature} />
                </ListItem>
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
