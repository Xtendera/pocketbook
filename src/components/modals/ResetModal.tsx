import { useState } from 'react';
import { trpc } from '~/utils/trpc';
import Modal, { ModalActions } from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose }) => {
  const [oldPass, setOldPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const resetPass = trpc.auth.resetPassword.useMutation();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProcessing(true);
    setErr('');
    const req = await resetPass.mutateAsync({
      oldPassword: oldPass,
      newPasword: newPass,
    });
    if (!req || !req.success) {
      setErr(req?.message);
    } else {
      onClose();
    }
    setProcessing(false);
  }

  function handleClose() {
    onClose();
  }

  return (
    <Modal isOpen={isOpen}>
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <Input
          label="Old Password:"
          type="password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          placeholder="Enter your old password..."
          disabled={processing}
        />

        <Input
          label="New Password:"
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          placeholder="Enter a new password..."
          disabled={processing}
        />

        {err && <div className="text-red-300">{err}</div>}

        <ModalActions>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={processing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={processing} className="flex-1">
            {processing ? 'Submitting' : 'Submit'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
};

export default ResetModal;
