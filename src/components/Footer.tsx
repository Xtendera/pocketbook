import getConfig from 'next/config';

const Footer: React.FC = () => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <footer className="mb-4 flex justify-between">
      <span>
        Developed by{' '}
        <a href="http://github.com/Xtendera" target="_blank">
          Xtendera
        </a>
      </span>
      <span>
        Version{' '}
        {`${publicRuntimeConfig.APP_VERSION}+${publicRuntimeConfig.COMMIT_HASH}`}
      </span>
    </footer>
  );
};

export default Footer;
