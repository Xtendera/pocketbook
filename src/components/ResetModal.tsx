import { useState } from 'react';
import { trpc } from '~/utils/trpc';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#17171d] border border-pocket-blue rounded-xl p-8 w-96 max-w-[90vw]">
        <div className="flex flex-col items-center space-y-6">
          <form
            className="flex flex-col space-y-4 w-full"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="oldPass"
                className="block text-sm text-gray-400 mb-2"
              >
                Old Password:
              </label>
              <input
                type="password"
                id="oldPass"
                value={oldPass}
                disabled={processing}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Enter your old password..."
                className="w-full px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-none focus:outline-none text-white placeholder-gray-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="newPass"
                className="block text-sm text-gray-400 mb-2"
              >
                New Password:
              </label>
              <input
                type="password"
                id="newPass"
                value={newPass}
                disabled={processing}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter a new password..."
                className="w-full px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-none focus:outline-none text-white placeholder-gray-500 disabled:opacity-50"
              />
            </div>
            {err ? <div className="text-red-300">{err}</div> : ''}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-pocket-disabled disabled:cursor-default text-white rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-2 bg-pocket-blue hover:bg-blue-600 disabled:bg-pocket-disabled disabled:cursor-default text-white rounded-xl cursor-pointer transition-colors"
              >
                {processing ? 'Submitting' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;
