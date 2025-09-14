import { NextPageWithLayout } from '../_app';
import { useRouter } from 'next/router';
import { IReactReaderStyle, ReactReader, ReactReaderStyle } from 'react-reader';
import { useState, useRef, useEffect } from 'react';
import { type Rendition } from 'epubjs';

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
}

const ReaderPages: NextPageWithLayout = () => {
  const [location, setLocation] = useState<string | number>(0);
  const router = useRouter();
  const { id: bookID } = router.query;
  const rendition = useRef<Rendition | undefined>(undefined);
  const [theme, setTheme] = useState<ITheme>('dark');

  useEffect(() => {
    if (rendition.current) {
      updateTheme(rendition.current, theme);
    }
  }, [theme]);

  if (!router.isReady || !bookID || typeof bookID !== 'string') {
    return (
      <div className="min-w-screen min-h-screen mx-8 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh' }}>
      <ReactReader
        url={"/api/content/" + bookID + '.epub'}
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
