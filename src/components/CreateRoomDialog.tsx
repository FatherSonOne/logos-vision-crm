import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomName: string) => void;
}

export const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onSave(roomName.trim());
      setRoomName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Channel Name"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="#e-g-project-kickoff"
          required
          fullWidth
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Create Channel</Button>
        </div>
      </form>
    </Modal>
  );
};
