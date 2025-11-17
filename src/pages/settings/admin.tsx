import { Footer, Nav } from '~/components/layout';
import UserManPanel from '~/components/ui/UserManPanel';
import { GetServerSideProps } from 'next';
import { extractTokenBody } from '~/utils/jwt';
import { prisma } from '~/server/prisma';

interface AdminPageProps {
  config: {
    isDemoMode: boolean;
  };
}

const AdminPage: React.FC<AdminPageProps> = ({ config }) => {
  return (
    <div className="flex flex-col h-screen mx-8">
      <Nav />
      <div className="flex-1">
        <h2 className="flex text-2xl mt-10">User Management</h2>
        <UserManPanel isDemo={config.isDemoMode} />
      </div>

      <Footer />
    </div>
  );
};

export default AdminPage;

export const getServerSideProps: GetServerSideProps<AdminPageProps> = async ({
  req,
}) => {
  // Check if user is authenticated and is an admin
  const cookie = req.cookies.jwt;

  if (!cookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const tokenBody = await extractTokenBody(cookie);

  if (!tokenBody || !tokenBody.sub) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { uuid: tokenBody.sub },
    select: { permission: true },
  });

  if (!user || user.permission !== 3) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const appConfig = {
    isDemoMode: process.env.DEMO === 'true',
  };

  return {
    props: {
      config: appConfig,
    },
  };
};
