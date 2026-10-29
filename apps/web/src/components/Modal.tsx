import { ReactNode, useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  labelledBy: string;
  /** Esc / backdrop close. Omit to make the modal non-dismissable. */
  onClose?: () => void;
  children: ReactNode;
}

/** Native <dialog> with showModal(): focus trap, Esc and inert background for free. */
export function Modal({ open, labelledBy, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
    >
      {open && children}
    </dialog>
  );
}
