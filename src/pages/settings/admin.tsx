import { MdDelete } from 'react-icons/md';
import { Footer, Nav } from '~/components/layout';
import Button from '~/components/ui/Button';
import Modal, { ModalActions } from '~/components/ui/Modal';
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
import { trpc } from '~/utils/trpc';
import { useState } from 'react';

const permissions = ['Viewer', 'User', 'Admin'];

const AdminPage = () => {
  const utils = trpc.useUtils();
  const users = trpc.admin.getUsers.useQuery();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    username: string;
  } | null>(null);

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

  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <div className="flex-1">
        <h2 className="flex text-2xl mt-10">User Management</h2>
        <Button
          className="mt-4 cursor-pointer"
          onClick={() => setShowDeleteModal(true)}
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
              ? users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
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
                          >
                            <MdDelete size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete user</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

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
          >
            Delete
          </Button>
        </ModalActions>
      </Modal>

      <Footer />
    </div>
  );
};

export default AdminPage;
