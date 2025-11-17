import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { MdDelete } from 'react-icons/md';
import Button from './Button';
import Modal, { ModalActions } from './Modal';
import Input from './Input';
import { InfoIcon } from '../icons';
import { useState } from 'react';
import { trpc } from '~/utils/trpc';
import TooltipToggle from './TooltipToggle';

const permissions = ['Viewer', 'User', 'Admin'];

interface UserManPanelProps {
  isDemo: boolean;
}

const UserManPanel: React.FC<UserManPanelProps> = ({ isDemo }) => {
  const utils = trpc.useUtils();
  const users = trpc.admin.getUsers.useQuery();
  const { data: currentUser } = trpc.auth.getInfo.useQuery();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    username: string;
  } | null>(null);

  // New user form state
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPermissionLevel, setNewPermissionLevel] = useState<string>('2');
  const [addPassToggle, setAddPassToggle] = useState<boolean>(false);
  const [newPass, setNewPass] = useState<string>('');
  const [newConfirm, setNewConfirm] = useState<string>('');

  const handleDeleteClick = (userId: string, username: string) => {
    setUserToDelete({ id: userId, username });
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement delete w/ backend

    // Invalidate the userlist
    utils.admin.getUsers.invalidate();
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
  };

  const handleConfirmAdd = () => {
    utils.admin.getUsers.invalidate();
  };

  return (
    <>
      <Button
        className="mt-4 cursor-pointer"
        onClick={() => setShowAddModal(true)}
      >
        Create User
      </Button>
      <Table className="mt-8">
        <TableCaption>User management panel</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">User ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Permission Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data
            ? users.data.map((user) => {
                const isCurrentUser = user.username === currentUser?.username;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>
                      {user.username}
                      {isCurrentUser && (
                        <span className="text-pocket-blue ml-1">(You)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {permissions[user.permissionLevel - 1]}
                    </TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="danger"
                            onClick={() =>
                              handleDeleteClick(user.id, user.username)
                            }
                            disabled={isCurrentUser}
                          >
                            <MdDelete size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {isCurrentUser
                              ? 'Cannot delete yourself'
                              : 'Delete user'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>
      <Modal isOpen={showDeleteModal} title="Confirm Delete">
        <p className="text-white text-center">
          Are you sure you want to delete user{' '}
          <span className="font-bold text-pocket-blue">
            {userToDelete?.username}
          </span>
          ?
        </p>
        <p className="text-gray-400 text-sm text-center">
          This action cannot be undone.
        </p>
        <span className="text-base ml-1 text-yellow-300 inline-flex items-center gap-1 align-middle">
          <InfoIcon className="text-yellow-300 inline-block shrink-0" />
          This action cannot be performed in DEMO mode
        </span>
        <ModalActions>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleCancelDelete}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleConfirmDelete}
            disabled={isDemo}
          >
            Delete
          </Button>
        </ModalActions>
      </Modal>
      <Modal isOpen={showAddModal} title="Create User">
        <div className="w-full space-y-4">
          <Input
            label="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter username"
          />

          <div className="w-full">
            <label className="block text-sm text-gray-400 mb-2">
              Permission Level
            </label>
            <select
              value={newPermissionLevel}
              onChange={(e) => setNewPermissionLevel(e.target.value)}
              className="w-full px-3 py-2 bg-pocket-field border border-pocket-blue rounded-xl outline-none focus:outline-none text-white"
            >
              <option value="1">Viewer</option>
              <option value="2">User</option>
              <option value="3">Admin</option>
            </select>
          </div>
          <TooltipToggle
            label="Set Password"
            checked={addPassToggle}
            onChange={setAddPassToggle}
            tooltipMessage="You can either set the password now, or have the user set it using a temporary activation code on first login."
          />
          {addPassToggle && (
            <>
              <Input
                label="Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                type="password"
                placeholder="Enter a new password..."
              />
              <Input
                label="Confirm"
                value={newConfirm}
                onChange={(e) => setNewConfirm(e.target.value)}
                type="password"
                placeholder="Confirm"
              />
            </>
          )}
        </div>

        {isDemo && (
          <span className="text-base ml-1 text-yellow-300 inline-flex items-center gap-1 align-middle">
            <InfoIcon className="text-yellow-300 inline-block shrink-0" />
            This action cannot be performed in DEMO mode
          </span>
        )}
        <ModalActions>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleCancelAdd}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleConfirmAdd}
            disabled={isDemo}
          >
            Create
          </Button>
        </ModalActions>
      </Modal>
    </>
  );
};

export default UserManPanel;
