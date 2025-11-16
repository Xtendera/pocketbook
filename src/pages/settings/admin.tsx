import { Footer, Nav } from '~/components/layout';
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

const AdminPage = () => {
  // const utils = trpc.useUtils();
  const users = trpc.admin.getUsers.useQuery();
  const permissions = ['Viewer', 'User', 'Admin'];
  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <div className="flex-1 flex justify-center">
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
                    <TableCell></TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
