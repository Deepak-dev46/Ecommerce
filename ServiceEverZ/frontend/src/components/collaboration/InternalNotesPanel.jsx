 
// src/components/collaboration/InternalNotesPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress, Alert,
  Paper, Divider, Chip, Avatar, Tooltip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { getInternalNotes, addInternalNote } from '../../api/collaborationApi';
import { getSupportAgents } from '../../api/collaborationApi';
import { tokenUtils } from '../../api/axiosInstance';
 
const fmt = (dt) =>
  dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
 
export default function InternalNotesPanel({ ticketId, isClosed }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
 
  // @mention
  const [suggestions, setSuggestions] = useState([]);
  const [allAgents, setAllAgents] = useState([]);   // full list loaded once
  const [mentionedAgents, setMentionedAgents] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionLoading, setMentionLoading] = useState(false);
  const textRef = useRef();
 
  const user = tokenUtils.getUser();
 
  // ── Load notes ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    getInternalNotes(ticketId)
      .then(res => setNotes(res.data))
      .catch(() => setError('Failed to load internal notes.'))
      .finally(() => setLoading(false));
  }, [ticketId]);
 
  // ── Pre-load all support agents once on mount ──────────────────────────────
  useEffect(() => {
  setMentionLoading(true);
  const currentUserId = user?.userId || user?.id || null;  // ← resolve your own ID
  getSupportAgents('', currentUserId)          // ← pass it here
    .then(agents => {
      console.log("Agents Loaded:", agents);
      setAllAgents(agents);
    })
    .catch(err => {
      console.log(err);
      setAllAgents([]);
    })
    .finally(() => setMentionLoading(false));
}, []);
 
  // ── Detect @ and show filtered suggestions ─────────────────────────────────
  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
 
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1) {
      const query = val.slice(atIdx + 1).toLowerCase();
      const filtered = allAgents.filter(
        a =>
          a.fullName.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };
 
  // ── User picks a suggestion ────────────────────────────────────────────────
  const handleSelectMention = (agent) => {
    const atIdx = content.lastIndexOf('@');
    const newContent = content.slice(0, atIdx) + `@${agent.fullName} `;
    setContent(newContent);
    setShowSuggestions(false);
    setSuggestions([]);
    if (!mentionedAgents.find(a => a.userId === agent.userId)) {
      setMentionedAgents(prev => [...prev, agent]);
    }
    setTimeout(() => textRef.current?.focus(), 50);
  };
 
  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        ticketId,
        authorId: user?.userId || 1,
        authorName: user?.fullName || user?.email || 'Support Agent',
        content: content.trim(),
        mentionedAgentIds: mentionedAgents.map(a => a.userId),
      };
      const res = await addInternalNote(body);
      setNotes(prev => [...prev, res.data]);
      setContent('');
      setMentionedAgents([]);
      setSuccess('Note saved.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };
 
  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3 }}>
 
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LockIcon color="warning" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={700}>
          Internal Notes (Work Notes)
        </Typography>
        <Chip label="Support Only" size="small" color="warning" variant="outlined" />
        {mentionLoading && (
          <Chip
            label="Loading agents…"
            size="small"
            variant="outlined"
            icon={<CircularProgress size={10} />}
          />
        )}
      </Box>
 
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
 
      {/* Existing notes */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No internal notes yet.
        </Typography>
      ) : (
        <Box sx={{ mb: 2, maxHeight: 380, overflowY: 'auto' }}>
          {notes.map((note) => (
            <Paper
              key={note.noteId}
              variant="outlined"
              sx={{
                p: 2, mb: 1.5,
                backgroundColor: '#fffde7',
                borderLeft: '4px solid #f9a825',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: '#f9a825' }}>
                  {note.authorName?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <Typography variant="body2" fontWeight={600}>{note.authorName}</Typography>
                <Typography variant="caption" color="text.secondary">{fmt(note.createdAt)}</Typography>
                <LockIcon sx={{ fontSize: 14, color: '#bbb', ml: 'auto' }} />
              </Box>
 
              {/* Render @mentions in blue */}
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {note.content.split(/(@\w[\w\s]*)/g).map((part, i) =>
                  part.startsWith('@')
                    ? <Box key={i} component="span" sx={{ color: '#1976d2', fontWeight: 600 }}>{part}</Box>
                    : part
                )}
              </Typography>
 
              {note.mentionedAgentIds?.length > 0 && (
                <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AlternateEmailIcon sx={{ fontSize: 13, color: '#1976d2' }} />
                  <Typography variant="caption" color="primary">
                    Mentioned {note.mentionedAgentIds.length} agent(s)
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
 
      {/* <Divider sx={{ mb: 2 }} /> */}
      <Divider sx={{ mb: 2 }} />
 
      {/* ── New note input ───────────────────────────────────────── */}
      <Box sx={{ position: 'relative' }}>
 
        {/* @mention dropdown — rendered ABOVE the text field */}
        {showSuggestions && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              bottom: '100%',          // ← appears ABOVE the textarea
              left: 0,
              zIndex: 1400,
              width: '100%',
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid #c7c9e8',
              borderRadius: '10px',
              mb: 0.5,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
            }}
          >
            {suggestions.length === 0 ? (
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {mentionLoading ? 'Loading agents…' : 'No matching agents found'}
                </Typography>
              </Box>
            ) : (
              suggestions.map(agent => (
                <Box
                  key={agent.userId}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectMention(agent);
                  }}
                  sx={{
                    px: 2, py: 1, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    '&:hover': { backgroundColor: '#f0f4ff' },
                    transition: 'background 0.12s',
                  }}
                >
                  <Avatar sx={{
                    width: 32, height: 32, fontSize: 13,
                    background: 'linear-gradient(135deg, #27235C 0%, #97247E 100%)',
                    fontWeight: 700,
                  }}>
                    {agent.fullName?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                      {agent.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agent.email}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        )}
        {isClosed ? "" : <Box>
          {/* Mentioned agent chips */}
          {mentionedAgents.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {mentionedAgents.map(a => (
                <Chip
                  key={a.userId}
                  label={`@${a.fullName}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onDelete={() =>
                    setMentionedAgents(prev => prev.filter(x => x.userId !== a.userId))
                  }
                />
              ))}
            </Box>
          )}
 
          <TextField
            inputRef={textRef}
            fullWidth
            multiline
            minRows={3}
            placeholder="Add a work note… type @ to mention a support agent"
            value={content}
            onChange={handleContentChange}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggestions(false); }}
            sx={{ mb: 1.5 }}
            InputProps={{ sx: { backgroundColor: '#fffde7', borderRadius: '10px' } }}
          />
 
          <Button
            variant="contained"
            endIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={!content.trim() || saving}
            sx={{
              backgroundColor: '#27235C', color: '#fff', borderRadius: '8px',
              '&:hover': { backgroundColor: '#1B193F' },
            }}
          >
            {saving ? 'Saving…' : 'Add Note'}
          </Button>
        </Box>
        }
      </Box>
 
    </Box>
  );
}
 
 