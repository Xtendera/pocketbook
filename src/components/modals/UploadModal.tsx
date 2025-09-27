import { useState } from 'react';
import { trpc } from '~/utils/trpc';
import Modal, { ModalActions } from '../ui/Modal';
import Input from '../ui/Input';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (isPrivate: boolean, title: string, files: FileList) => void;
  files: FileList | null;
  uploading: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  files,
  uploading,
}) => {
  const [title, setTitle] = useState<string>('');
  const [searchID, setSearchID] = useState<string>('');
  const [searchError, setSearchError] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const utils = trpc.useUtils();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    if (!title.trim()) {
      alert('Please enter a title for the book');
      return;
    }
    onUpload(isPrivate, title.trim(), files);
  };

  const handleClose = () => {
    if (uploading) return;
    setTitle('');
    onClose();
  };

  const updateSearchID = async (input: string) => {
    setSearchID(input);
    if (input.slice(0, 2) !== 'OL' && input.slice(-1) !== 'W') {
      return;
    }
    try {
      const data = await utils.books.searchID.fetch(input);
      setSearchError('');
      if (!data.success) {
        setSearchError(data.message);
        return;
      }
      if (!data.title) {
        setSearchError(data.message);
        return;
      }
      setTitle(data.title);
    } catch {
      setSearchError('Unkown error! Check console!');
      return;
    }
  };

  const handleSearchIDPaste = async (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const pastedText = e.clipboardData.getData('text');
    const trimmedText = pastedText.trim();

    // Let the default paste behavior happen first
    setTimeout(() => {
      updateSearchID(trimmedText);
    }, 0);
  };

  const fileName = files && files.length > 0 ? files[0].name : '';
  const isMultiple = files && files.length > 1;

  return (
    <Modal isOpen={isOpen} title="Upload Book">
      <div className="w-full">
        <div className="text-sm text-gray-400 mb-2">Selected file:</div>
        <div className="text-sm text-white bg-pocket-field border border-pocket-blue rounded-xl px-3 py-2 truncate">
          {isMultiple ? `${files?.length || 0} files selected` : fileName}
        </div>
      </div>

      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <Input
          label="ISBN/OpenLibrary Work ID (Optional):"
          value={searchID}
          onChange={(e) => updateSearchID(e.target.value)}
          onPaste={handleSearchIDPaste}
          placeholder="140566438X/9781405664387/OL102749W"
          disabled={uploading}
          error={searchError}
        />

        <Input
          label="Book Title:"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title"
          disabled={uploading}
          required
        />

        <Toggle
          label="Private:"
          checked={isPrivate}
          onChange={setIsPrivate}
          disabled={uploading}
        />

        <ModalActions>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={uploading}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            type="submit"
            disabled={uploading || !title.trim()}
            className="flex-1"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
};

export default UploadModal;
