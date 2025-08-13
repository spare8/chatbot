import * as React from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Divider, Alert,
  Snackbar, InputAdornment, IconButton, Chip, Stack, CircularProgress,
} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {ConfigStatusContext} from '../../lib/configStatusContext';

export const title = 'Configuration';

const SECRET_KEYS = new Set([
  'OPENAI_API_KEY',
  'AWS_SECRET_ACCESS_KEY',
  'MONGODB_URI',
]);

const REQUIRED_KEYS = [
  'OPENAI_API_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'S3_BUCKET_NAME',
  'MONGODB_URI',
];

const FIELD_META = [
  {
    label: 'OpenAI',
    fields: [{key: 'OPENAI_API_KEY', label: 'OpenAI API Key'}],
  },
  {
    label: 'AWS (S3)',
    fields: [
      {key: 'AWS_ACCESS_KEY_ID', label: 'AWS Access Key ID'},
      {key: 'AWS_SECRET_ACCESS_KEY', label: 'AWS Secret Access Key'},
      {key: 'AWS_REGION', label: 'AWS Region'},
      {key: 'S3_BUCKET_NAME', label: 'S3 Bucket Name'},
    ],
  },
  {
    label: 'MongoDB',
    fields: [{key: 'MONGODB_URI', label: 'MongoDB URI'}],
  },
];

export default function ConfigPage() {
  // ✅ useContext must be inside the component
  const {refresh: refreshConfigStatus} = React.useContext(ConfigStatusContext);

  const [masked, setMasked] = React.useState({});
  const [status, setStatus] = React.useState({ok: true, missing: []});
  const [edits, setEdits] = React.useState({});
  const [revealed, setRevealed] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState({open: false, msg: '', severity: 'success'});
  const [testing, setTesting] = React.useState({openai: false, mongodb: false});
  const [testOk, setTestOk] = React.useState({openai: null, mongodb: null});

  const runTestOpenAI = async () => {
    setTesting((p) => ({...p, openai: true}));
    try {
      const body = {};
      if (edits.OPENAI_API_KEY) {
        body.OPENAI_API_KEY = edits.OPENAI_API_KEY;
      }
      const r = await fetch('/api/admin/config/test/openai', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      const j = await r.json();
      setTestOk((p) => ({...p, openai: !!j.ok}));
      if (!j.ok) {
        setSnack({open: true, msg: j.error || 'OpenAI test failed', severity: 'error'});
      }
    } finally {
      setTesting((p) => ({...p, openai: false}));
    }
  };

  const runTestMongo = async () => {
    setTesting((p) => ({...p, mongodb: true}));
    try {
      const body = {};
      if (edits.MONGODB_URI) {
        body.MONGODB_URI = edits.MONGODB_URI;
      }
      const r = await fetch('/api/admin/config/test/mongodb', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      const j = await r.json();
      setTestOk((p) => ({...p, mongodb: !!j.ok}));
      if (!j.ok) {
        setSnack({open: true, msg: j.error || 'MongoDB test failed', severity: 'error'});
      }
    } finally {
      setTesting((p) => ({...p, mongodb: false}));
    }
  };

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [envRes, statusRes] = await Promise.all([
        fetch('/api/admin/config/env'),
        fetch('/api/admin/config/status'),
      ]);
      const env = await envRes.json();
      const st = await statusRes.json();
      setMasked(env || {});
      setStatus(st || {ok: false, missing: []});
    } catch {
      setStatus({ok: false, missing: []});
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onChange = (key, value) => {
    setEdits((p) => ({...p, [key]: value}));
    if (key === 'OPENAI_API_KEY') {
      setTestOk((p) => ({...p, openai: null}));
    }
    if (key === 'MONGODB_URI') {
      setTestOk((p) => ({...p, mongodb: null}));
    }
  };

  const onToggleReveal = (key) => setRevealed((p) => ({...p, [key]: !p[key]}));
  const resetChanges = () => {
    setEdits({}); setRevealed({});
  };

  const isDirty = Object.keys(edits).some((k) => edits[k] !== undefined && edits[k] !== '');
  const changedOpenAI = edits.OPENAI_API_KEY !== undefined && edits.OPENAI_API_KEY !== '';
  const changedMongo = edits.MONGODB_URI !== undefined && edits.MONGODB_URI !== '';
  const saveDisabled =
    !isDirty ||
    (changedOpenAI && testOk.openai !== true) ||
    (changedMongo && testOk.mongodb !== true);

  const waitForConfigured = React.useCallback(async (tries = 10, delayMs = 1000) => {
    for (let i = 0; i < tries; i++) {
      const r = await fetch('/api/admin/config/status');
      const j = await r.json();
      if (j && j.ok) {
        return true;
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
    return false;
  }, []);

  const handleSave = async () => {
    const payloadEntries = Object.entries(edits).filter(([, v]) => v !== '' && v !== undefined);
    if (payloadEntries.length === 0) {
      setSnack({open: true, msg: 'Nothing to save', severity: 'info'});
      return;
    }
    const payload = Object.fromEntries(payloadEntries);
    setSaving(true);
    try {
      const r = await fetch('/api/admin/config/env', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(json?.error || 'Failed to save');
      }

      setSnack({open: true, msg: 'Saved. Restarting server…', severity: 'success'});
      setEdits({});

      setTimeout(async () => {
        // poll until backend reports ok (handles nodemon restart timing)
        await waitForConfigured(10, 800);
        await fetchAll();
        await refreshConfigStatus();
        setTestOk({openai: null, mongodb: null});
      }, 1200);
    } catch (e) {
      setSnack({open: true, msg: e.message || 'Save failed', severity: 'error'});
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <Box sx={{p: 3}}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{p: 2, display: 'grid', gap: 2}}>
      {!status.ok && (
        <Alert severity="warning" icon={false} sx={{border: '1px dashed', borderColor: 'warning.main'}}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1">Setup pending:</Typography>
            {(status.missing || []).map((k) => (
              <Chip key={k} label={k} size="small" color="warning" variant="outlined" />
            ))}
          </Stack>
        </Alert>
      )}

      {FIELD_META.map((group) => (
        <Paper key={group.label} variant="outlined" sx={{p: 2}}>
          <Typography variant="h6" sx={{mb: 1}}>{group.label}</Typography>
          <Divider sx={{mb: 2}} />
          <Grid container spacing={2}>
            {group.fields.map(({key, label}) => {
              const isSecret = SECRET_KEYS.has(key);
              const required = REQUIRED_KEYS.includes(key);
              const valueEdited = edits[key] ?? '';
              const currentMasked = masked[key] || '';
              const locked = key === 'ADMIN_PANEL_TOKEN';

              return (
                <Grid key={key} item xs={12} md={6}>
                  <Stack spacing={1}>
                    <TextField
                      fullWidth
                      label={`${label}${required ? ' *' : ''}`}
                      value={locked ? '' : valueEdited}
                      onChange={locked ? undefined : (e) => onChange(key, e.target.value)}
                      type={isSecret && !locked ? (revealed[key] ? 'text' : 'password') : 'text'}
                      placeholder={isSecret ? '••••••••' : ''}
                      disabled={locked}
                      InputProps={{
                        endAdornment: isSecret && !locked ? (
                          <InputAdornment position="end">
                            <IconButton tabIndex={-1} onClick={() => onToggleReveal(key)} edge="end">
                              {revealed[key] ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      }}
                      helperText={locked ? 'Auto-generated; not editable' :
                          (currentMasked ? `Current: ${currentMasked}` : '')}
                    />

                    {key === 'OPENAI_API_KEY' && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button size="small" onClick={runTestOpenAI}
                          disabled={testing.openai || !edits.OPENAI_API_KEY }>
                          {testing.openai ? 'Testing…' : 'Test OpenAI'}
                        </Button>
                        {testOk.openai === true && <Chip size="small" color="success" label="OK" />}
                        {testOk.openai === false && <Chip size="small" color="error" label="Failed" />}
                      </Stack>
                    )}

                    {key === 'MONGODB_URI' && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button size="small" onClick={runTestMongo}
                          disabled={testing.mongodb || !edits.MONGODB_URI }>
                          {testing.mongodb ? 'Testing…' : 'Test MongoDB'}
                        </Button>
                        {testOk.mongodb === true && <Chip size="small" color="success" label="OK" />}
                        {testOk.mongodb === false && <Chip size="small" color="error" label="Failed" />}
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      ))}

      <Box sx={{display: 'flex', gap: 1}}>
        <Button variant="contained" onClick={handleSave} disabled={saving || saveDisabled}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button onClick={resetChanges} disabled={saving || !isDirty}>
          Reset
        </Button>
        <Box sx={{flexGrow: 1}} />
        <Chip
          size="small"
          color={status.ok ? 'success' : 'warning'}
          label={status.ok ? 'Configured' : 'Pending'}
          variant="outlined"
        />
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({...s, open: false}))}
        message={snack.msg}
      />
    </Box>
  );
}
