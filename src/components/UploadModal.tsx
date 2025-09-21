import { useState } from 'react';
import { trpc } from '~/utils/trpc';

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
                htmlFor="searchId"
                className="block text-sm text-gray-400 mb-2"
              >
                ISBN/OpenLibrary Work ID (Optional):
              </label>
              <input
                type="text"
                id="searchId"
                value={searchID}
                onChange={(e) => updateSearchID(e.target.value)}
                onPaste={handleSearchIDPaste}
                placeholder="140566438X/9781405664387/OL102749W"
                disabled={uploading}
                className={`w-full px-3 py-2 bg-pocket-field border rounded-xl outline-none focus:outline-none ${searchError ? 'border-red-500' : 'border-pocket-blue'} text-white placeholder-gray-500 disabled:opacity-50`}
              />
              {searchError && (
                <span className="text-sm text-red-500">{searchError}</span>
              )}
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
            <div className="flex items-center justify-between">
              <label htmlFor="access" className="text-sm text-gray-400">
                Private:
              </label>
              <button
                type="button"
                id="access"
                disabled={uploading}
                className={`relative inline-flex h-6 w-11 items-center disabled:cursor-auto cursor-pointer rounded-full transition-colors focus:ring-offset-[#17171d] ${isPrivate ? 'bg-pocket-blue' : 'bg-gray-600'}`}
                onClick={() => setIsPrivate(!isPrivate)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
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
