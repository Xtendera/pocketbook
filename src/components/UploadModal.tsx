import { useState } from 'react';
import { trpc } from '~/utils/trpc';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, files: FileList) => void;
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
  const utils = trpc.useUtils();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    if (!title.trim()) {
      alert('Please enter a title for the book');
      return;
    }
    onUpload(title.trim(), files);
  };

  const handleClose = () => {
    if (uploading) return;
    setTitle('');
    onClose();
  };

  const updateSearchID = async (input: string) => {
    setSearchID(input);
    if (input.length !== 10 && input.length !== 13) {
      return;
    }
    try {
      const data = await utils.books.searchID.fetch(input);
      if (!data.success) {
        // WIP
      }
      if (!data.title) {
        // WIP
      }
      // alert(data.message)
      setTitle(data.title);
    } catch {
      // WIP
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#17171d] border border-pocket-blue rounded-xl p-8 w-96 max-w-[90vw]">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-2xl text-white">Upload Book</h2>

          <div className="w-full">
            <div className="text-sm text-gray-400 mb-2">Selected file:</div>
            <div className="text-sm text-white bg-pocket-field border border-pocket-blue rounded-xl px-3 py-2 truncate">
              {isMultiple ? `${files?.length || 0} files selected` : fileName}
            </div>
          </div>

          <form
            className="flex flex-col space-y-4 w-full"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="title"
                className="block text-sm text-gray-400 mb-2"
              >
                ISBN/OpenLibrary Work ID (Optional):
              </label>
              <input
                type="text"
                id="title"
                value={searchID}
                onChange={(e) => updateSearchID(e.target.value)}
                onPaste={handleSearchIDPaste}
                placeholder="140566438X/9781405664387/OL102749W"
                disabled={uploading}
                className="w-full px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-none focus:outline-none text-white placeholder-gray-500 disabled:opacity-50"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="title"
                className="block text-sm text-gray-400 mb-2"
              >
                Book Title:
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                disabled={uploading}
                className="w-full px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-none focus:outline-none text-white placeholder-gray-500 disabled:opacity-50"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-pocket-disabled disabled:cursor-default text-white rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={uploading || !title.trim()}
                className="flex-1 px-4 py-2 bg-pocket-blue hover:bg-blue-600 disabled:bg-pocket-disabled disabled:cursor-default text-white rounded-xl cursor-pointer transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
