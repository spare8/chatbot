// pages/admin/vector-stores/index.js
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  UploadFile as UploadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const API_BASE = 'http://localhost:3000/vectorStore';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#121212', paper: '#1d1d1d' },
    primary: { main: '#90caf9' },
  },
});

const bytesToSize = (bytes = 0) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (!bytes) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

export default function VectorStorePage() {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [createDlg, setCreateDlg] = useState(false);
  const [newVS, setNewVS] = useState({
    name: '',
    description: '',
    maxChunkSize: 300,
    maxChunkOverlap: 40,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeVS, setActiveVS] = useState(null);
  const [fileInputs, setFileInputs] = useState({});
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_BASE}/list`);
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching vector stores:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return stores;
    const q = search.toLowerCase();
    return stores.filter((vs) => {
      if (vs.name?.toLowerCase().includes(q)) return true;
      return (vs.files || []).some((f) =>
        (f.fileName || '').toLowerCase().includes(q)
      );
    });
  }, [search, stores]);

  const handleCreateVS = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/create`, newVS);
      setCreateDlg(false);
      setNewVS({ name: '', description: '', maxChunkSize: 300, maxChunkOverlap: 40 });
      await fetchStores();
    } catch (err) {
      console.error('Error creating vector store:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVS = (vs) => {
    setDeleteInfo({ type: 'vs', data: vs });
  };
  const confirmDeleteVS = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/delete`, { vectorStoreId: deleteInfo.data.openaiId });
      setDeleteInfo(null);
      await fetchStores();
    } catch (err) {
      console.error('Error deleting vector store:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = (vs, file) => {
    setDeleteInfo({ type: 'file', data: { vs, file } });
  };
  const confirmDeleteFile = async () => {
    setLoading(true);
    try {
      const { vs, file } = deleteInfo.data;
      await axios.post(`${API_BASE}/deleteFile`, {
        vectorStoreId: vs.openaiId,
        fileId:        file.openaiId,
      });
      setDeleteInfo(null);
      await fetchStores();
    } catch (err) {
      console.error('Error deleting file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (vs) => {
    const file = fileInputs[vs.openaiId];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('vectorStoreId', vs.openaiId);
      await axios.post(`${API_BASE}/createFile`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileInputs((p) => ({ ...p, [vs.openaiId]: null }));
      await fetchStores();
      setDrawerOpen(false);
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* App Bar with Back Button */}
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.back()} disabled={loading}>
            <ArrowBackIcon />
          </IconButton>
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            sx={{ width: 300, mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Vector Stores
          </Typography>
          <Tooltip title="Add Vector Store">
            <IconButton color="inherit" onClick={() => setCreateDlg(true)} disabled={loading}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Grid of Vector Stores */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {filtered.map((vs) => (
            <Grid item xs={12} md={6} lg={4} key={vs.openaiId}>
              <Card variant="outlined">
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FolderIcon fontSize="small" />
                    <Typography variant="subtitle1">{vs.name}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title="Delete vector store">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteVS(vs)}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'grey.400' }}>
                    {vs.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`Size: ${vs.maxChunkSize}`} size="small" />
                    <Chip label={`Overlap: ${vs.maxChunkOverlap}`} size="small" />
                    <Chip
                      label={`${vs.files?.length || 0} file${(vs.files?.length || 0) !== 1 ? 's' : ''}`}
                      size="small"
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setActiveVS(vs);
                      setDrawerOpen(true);
                    }}
                    disabled={loading}
                  >
                    Files ▸
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Ghost Card to Add New */}
          <Grid item xs={12} md={6} lg={4}>
            <Card
              variant="outlined"
              sx={{
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                '&:hover': loading ? {} : { bgcolor: 'grey.900' },
              }}
              onClick={() => !loading && setCreateDlg(true)}
            >
              <AddIcon fontSize="large" />
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* File Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => !loading && setDrawerOpen(false)}
        PaperProps={{ sx: { width: 380 } }}
      >
        {activeVS && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {activeVS.name} – Files
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <List dense>
                {(activeVS.files || []).map((file) => (
                  <ListItem
                    key={file.openaiId}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteFile(activeVS, file)}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <FileIcon sx={{ mr: 1 }} fontSize="small" />
                    <ListItemText
                      primary={file.fileName}
                      secondary={`${bytesToSize(file.fileSize)} • ${new Date(
                        file.updatedAt
                      ).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
                {activeVS.files?.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center' }}>
                    No files yet
                  </Typography>
                )}
              </List>
            </Box>

            <Divider sx={{ my: 1 }} />
            <input
              type="file"
              disabled={loading}
              onChange={(e) =>
                setFileInputs((p) => ({ ...p, [activeVS.openaiId]: e.target.files[0] }))
              }
            />
            <Button
              startIcon={<UploadIcon />}
              variant="contained"
              sx={{ mt: 1 }}
              onClick={() => handleFileUpload(activeVS)}
              disabled={loading || !fileInputs[activeVS.openaiId]}
            >
              Upload
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Create Vector Store Dialog */}
      <Dialog
        open={createDlg}
        onClose={() => !loading && setCreateDlg(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Vector Store</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Name"
            value={newVS.name}
            onChange={(e) => setNewVS((p) => ({ ...p, name: e.target.value }))}
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Description"
            value={newVS.description}
            onChange={(e) => setNewVS((p) => ({ ...p, description: e.target.value }))}
            fullWidth
            multiline
            disabled={loading}
          />
          <TextField
            label="Max Chunk Size"
            type="number"
            value={newVS.maxChunkSize}
            onChange={(e) =>
              setNewVS((p) => ({ ...p, maxChunkSize: Number(e.target.value) }))
            }
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Chunk Overlap"
            type="number"
            value={newVS.maxChunkOverlap}
            onChange={(e) =>
              setNewVS((p) => ({ ...p, maxChunkOverlap: Number(e.target.value) }))
            }
            fullWidth
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDlg(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreateVS} variant="contained" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteInfo && (
        <Dialog open onClose={() => !loading && setDeleteInfo(null)} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            {deleteInfo.type === 'vs' ? (
              <>
                <Typography sx={{ mb: 1 }}>
                  Delete vector store <b>{deleteInfo.data.name}</b>?
                </Typography>
                <Typography variant="body2">
                  {deleteInfo.data.files?.length || 0} file(s) will be removed.
                </Typography>
              </>
            ) : (
              <Typography>
                Delete file <b>{deleteInfo.data.file.fileName}</b> from{' '}
                <b>{deleteInfo.data.vs.name}</b>?
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteInfo(null)} disabled={loading}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={deleteInfo.type === 'vs' ? confirmDeleteVS : confirmDeleteFile}
              disabled={loading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </ThemeProvider>
  );
}
