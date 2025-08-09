import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import PageToolbar from '../../../components/PageToolbar';
import {
  Box, Card, CardContent, CardActions, Button, Typography, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Pagination,
  FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton,
  List, ListItem, ListItemText,
} from '@mui/material';
import {Edit, Delete, Remove, Add} from '@mui/icons-material';

const SERVER_URL = 'http://localhost:3000';
const API_BASE = `${SERVER_URL}/assistant`;
const ITEMS_PER_PAGE = 5;
const MODEL_OPTIONS = ['gpt-3.5-turbo', 'gpt-4'];

export const title = 'Manage Assistants';

export default function AssistantsPage() {
  const router = useRouter();
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list`);
      const data = await res.json();
      setAssistants(data);
    } catch {
      alert('Failed to load assistants');
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleCreate = () => {
    setCurrent({model: MODEL_OPTIONS[0], temperature: 0.7});
    setOpenEdit(true);
  };
  const handleEdit = (a) => {
    setCurrent({...a}); setOpenEdit(true);
  };
  const handleDeleteClick = (a) => {
    setDeleteTarget(a); setOpenDelete(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/delete`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({assistantId: deleteTarget.openaiId}),
    });
    setOpenDelete(false);
    setDeleteTarget(null);
    await fetchAssistants();
    setLoading(false);
  };

  const handleSave = async () => {
    const {openaiId, name, description, instructions, model, temperature} = current;
    const url = `${API_BASE}/${openaiId ? 'update' : 'create'}`;
    const body = openaiId ?
      {assistantId: openaiId, name, description, instructions, model, temperature} :
      {name, description, instructions, model, temperature};

    setLoading(true);
    await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
    setOpenEdit(false);
    await fetchAssistants();
    setLoading(false);
  };

  const onPageChange = (_, value) => setPage(value);

  const filtered = assistants.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.instructions.toLowerCase().includes(search.toLowerCase()),
  );
  const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box>
      <PageToolbar
        title="Assistants"
        onBack={() => router.back()}
        onCreate={handleCreate}
        search={search}
        onSearchChange={(v) => {
          setSearch(v); setPage(1);
        }}
      />

      <Box sx={{p: 2}}>
        {loading ? (
          <Typography>Loading…</Typography>
        ) : paged.length === 0 ? (
          <Typography>No assistants found.</Typography>
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center'}}>
            {paged.map((a) => (
              <Card key={a.openaiId} variant="outlined" sx={{width: '50%'}}>
                <CardContent sx={{p: 2}}>
                  <Typography variant="h6">{a.name}</Typography>
                  <Typography variant="body2" sx={{bgcolor: 'grey.800', p: 1, borderRadius: 1, mt: 1}}>
                    {a.model}
                  </Typography>
                  <Typography variant="body2" sx={{bgcolor: 'grey.800', p: 1, borderRadius: 1, mt: 1}}>
                    {a.description}
                  </Typography>
                  <Typography variant="body2" sx={{bgcolor: 'grey.800', p: 1, borderRadius: 1, mt: 1}}>
                    {a.instructions}
                  </Typography>
                  <Typography variant="body2" sx={{mt: 1}}>
                    Temp: {(typeof a.temperature === 'number' ? a.temperature : 0).toFixed(1)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button startIcon={<Edit />} onClick={() => handleEdit(a)}>Edit</Button>
                  <Button startIcon={<Delete />} color="error" onClick={() => handleDeleteClick(a)}>Delete</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        {pageCount > 1 && (
          <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
            <Pagination count={pageCount} page={page} onChange={onPageChange} color="primary" />
          </Box>
        )}
      </Box>

      {/* Edit/Create Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>{current?.openaiId ? 'Edit Assistant' : 'New Assistant'}</DialogTitle>
        <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
          <TextField
            label="Name"
            value={current?.name || ''}
            onChange={(e) => setCurrent((c) => ({...c, name: e.target.value}))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Model</InputLabel>
            <Select
              label="Model"
              value={current?.model || MODEL_OPTIONS[0]}
              onChange={(e) => setCurrent((c) => ({...c, model: e.target.value}))}
            >
              {MODEL_OPTIONS.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            value={current?.description || ''}
            onChange={(e) => setCurrent((c) => ({...c, description: e.target.value}))}
            fullWidth
            multiline
          />
          <TextField
            label="Instructions"
            value={current?.instructions || ''}
            onChange={(e) => setCurrent((c) => ({...c, instructions: e.target.value}))}
            fullWidth
            multiline
          />

          {/* Temperature control */}
          <TextField
            label="Temperature"
            type="number"
            value={current?.temperature ?? ''}
            onChange={(e) => {
              let v = parseFloat(e.target.value);
              if (Number.isNaN(v)) {
                v = 0;
              }
              v = Math.max(0, Math.min(2, v));
              setCurrent((c) => ({...c, temperature: v}));
            }}
            inputProps={{min: 0, max: 2, step: 0.1}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    size="small"
                    disabled={!current || current.temperature <= 0}
                    onClick={() =>
                      setCurrent((c) => {
                        const v = Math.max(0, (c.temperature || 0) - 0.1);
                        return {...c, temperature: parseFloat(v.toFixed(1))};
                      })
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
                    disabled={!current || current.temperature >= 2}
                    onClick={() =>
                      setCurrent((c) => {
                        const v = Math.min(2, (c.temperature || 0) + 0.1);
                        return {...c, temperature: parseFloat(v.toFixed(1))};
                      })
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
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Assistant?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this assistant?</Typography>
          {deleteTarget && (
            <List dense>
              <ListItem><ListItemText primary="Name" secondary={deleteTarget.name} /></ListItem>
              <ListItem><ListItemText primary="Model" secondary={deleteTarget.model} /></ListItem>
              <ListItem><ListItemText primary="Description" secondary={deleteTarget.description} /></ListItem>
              <ListItem><ListItemText primary="Instructions" secondary={deleteTarget.instructions} /></ListItem>
              <ListItem><ListItemText primary="Temp" secondary={deleteTarget.temperature.toFixed(1)} /></ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
