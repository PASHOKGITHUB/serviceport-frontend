// src/components/ui/CancellationReasonDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CancellationReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  serviceName?: string;
  isLoading?: boolean;
}

export const CancellationReasonDialog: React.FC<CancellationReasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Cancellation reason is required');
      return;
    }
    
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }

    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    if (error) setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Cancel Service</DialogTitle>
          <DialogDescription>
            {serviceName 
              ? `Please provide a reason for cancelling service "${serviceName}"`
              : 'Please provide a reason for cancelling this service'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Enter the reason for cancellation..."
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              className={error ? 'border-red-500' : ''}
              rows={4}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};