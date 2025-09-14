import { NextPageWithLayout } from '../_app';
import { useRouter } from 'next/router';
import { IReactReaderStyle, ReactReader, ReactReaderStyle } from 'react-reader';
import { useState, useRef, useEffect } from 'react';
import { type Rendition } from 'epubjs';
import { trpc } from '~/utils/trpc';

type ITheme = 'light' | 'dark';

function updateTheme(rendition: Rendition, theme: ITheme) {
  const themes = rendition.themes;
  switch (theme) {
    case 'dark': {
      themes.override('color', '#fff');
      themes.override('background', '#17171d');
      break;
    }
    case 'light': {
      themes.override('color', '#17171d');
      themes.override('background', '#fff');
      break;
    }
  }
}

const darkReaderTheme: IReactReaderStyle = {
  ...ReactReaderStyle,
  arrow: {
    ...ReactReaderStyle.arrow,
    color: 'white',
  },
  arrowHover: {
    ...ReactReaderStyle.arrowHover,
    color: '#ccc',
  },
  readerArea: {
    ...ReactReaderStyle.readerArea,
    backgroundColor: '#17171d',
    transition: undefined,
  },
  titleArea: {
    ...ReactReaderStyle.titleArea,
    color: '#ccc',
  },
  tocArea: {
    ...ReactReaderStyle.tocArea,
    background: '#111',
  },
  tocButtonExpanded: {
    ...ReactReaderStyle.tocButtonExpanded,
    background: '#222',
  },
  tocButtonBar: {
    ...ReactReaderStyle.tocButtonBar,
    background: '#fff',
  },
  tocButton: {
    ...ReactReaderStyle.tocButton,
    color: 'white',
  },
};

const ReaderPages: NextPageWithLayout = () => {
  const [location, setLocation] = useState<string | number>(0);
  const router = useRouter();
  const { id: bookID } = router.query;
  const rendition = useRef<Rendition | undefined>(undefined);
  const [theme] = useState<ITheme>('dark');
  const updateProgress = trpc.books.updateProgress.useMutation();

  // Move the query to the top level
  const { data: progress } = trpc.books.progress.useQuery(
    { bookId: bookID as string },
    { enabled: !!bookID && typeof bookID === 'string' && router.isReady },
  );

  // if (!router.isReady || !bookID || typeof bookID !== 'string') {
  //   return (
  //     <div className="min-w-screen min-h-screen mx-8 flex items-center justify-center">
  //       <div>Loading...</div>
  //     </div>
  //   );
  // }

  useEffect(() => {
    if (rendition.current) {
      updateTheme(rendition.current, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (!progress) {
      return;
    }

    if (progress.progress != 0 || progress.progressStr == '') {
      setLocation(progress.progress);
    } else {
      setLocation(progress.progressStr);
    }
  }, [progress]);

  useEffect(() => {
    if (
      !router.isReady ||
      !bookID ||
      typeof bookID !== 'string' ||
      location === 0 ||
      location === ''
    ) {
      return;
    }
    if (typeof location == 'number') {
      updateProgress.mutate({
        bookId: bookID,
        progress: location,
        progressStr: '',
      });
    } else {
      updateProgress.mutate({
        bookId: bookID,
        progress: 0,
        progressStr: location,
      });
    }
  }, [location]);

  return (
    <div style={{ height: '100vh' }}>
      <ReactReader
        url={'/api/content/' + bookID + '.epub'}
        location={location}
        readerStyles={darkReaderTheme}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
        getRendition={(_rendition) => {
          updateTheme(_rendition, theme);
          rendition.current = _rendition;
        }}
      />
    </div>
  );
};

export default ReaderPages;
