import { useState, useCallback, Dispatch, SetStateAction } from 'react';

interface useToggleReturn {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  toggle: () => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}


export default function useToggle(defaultValue = false): useToggleReturn {
  const [isOpen, setIsOpen] = useState<boolean>(defaultValue);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    handleOpen,
    handleClose,
    toggle,
    setIsOpen,
  };
}
