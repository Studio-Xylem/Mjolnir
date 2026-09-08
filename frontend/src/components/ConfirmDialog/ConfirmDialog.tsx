import React, { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default'
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      confirmBtnRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCancel();
    };

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        onCancel();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleBackdropClick);
    
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [onCancel]);

  return (
    <dialog 
      ref={dialogRef} 
      className="confirm-dialog"
      role="alertdialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      <div className="confirm-dialog-content">
        <h2 id="dialog-title" className="confirm-dialog-title">{title}</h2>
        <p id="dialog-desc" className="confirm-dialog-desc">{description}</p>
        
        <div className="confirm-dialog-actions">
          <button 
            type="button"
            className="btn-cancel" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="button"
            ref={confirmBtnRef}
            className={`btn-confirm ${variant === 'danger' ? 'btn-danger' : 'btn-default'}`} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
