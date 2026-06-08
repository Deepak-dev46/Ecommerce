import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  Paper, Typography, TextField, Button, Divider
} from '@mui/material';
import toast from 'react-hot-toast';

import {
  getTicketComments,
  addComment
} from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';

const fmt = d => new Date(d).toLocaleString();

export default function AdditionalDetailsModal({ open, onClose, ticketId }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const logged =useAuth()
  

  useEffect(() => {
    if (!open) return;
    getTicketComments(ticketId).then(({ data }) => setNotes(data));
  }, [open, ticketId]);

  const addNote = async () => {
    if (!text.trim()) return;
    try {
      await addComment(ticketId, { body: text.trim(), authorId: logged.user.userId, authorName: logged.user.fullName , authorRole:logged.user.role});
      setText('');
      const { data } = await getTicketComments(ticketId);
      setNotes(data);
      toast.success('Details added');
    } catch(e) {
      toast.error('Failed to add details');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Additional Details</DialogTitle>
      <DialogContent>
        {notes.map(n => (
          <Paper key={n.id} sx={{ p: 1.5, mb: 1 }}>
            <Typography fontWeight={600}>{n.authorName}</Typography>
            <Typography variant="caption">{fmt(n.createdAt)}</Typography>
            <Typography sx={{ mt: 0.5 }}>{n.body}</Typography>
          </Paper>
        ))}

        <Divider sx={{ my: 2 }} />

        <TextField
          multiline
          minRows={3}
          fullWidth
          placeholder="Add additional information for support team..."
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <Button sx={{ mt: 2 }} variant="contained" onClick={addNote}>
          Add Details
        </Button>
      </DialogContent>
    </Dialog>
  );
}