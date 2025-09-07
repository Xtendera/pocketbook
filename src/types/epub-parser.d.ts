declare module 'epub-parser' {
  interface EPubMetadata {
    title?: string;
    creator?: string | string[];
    description?: string;
    publisher?: string;
    language?: string;
    date?: string;
    subject?: string | string[];
    identifier?: string | string[];
    [key: string]: any;
  }

  interface EPubManifest {
    [key: string]: {
      id: string;
      href: string;
      'media-type': string;
    };
  }

  interface EPubSpine {
    toc: string;
    contents: Array<{
      id: string;
      href: string;
    }>;
  }

  interface EPubData {
    metadata: EPubMetadata;
    manifest: EPubManifest;
    spine: EPubSpine;
    flow: any[];
    toc: any[];
  }

  function parseEpub(filePath: string): Promise<EPubData>;
  function parseEpub(buffer: Buffer): Promise<EPubData>;
  
  export = parseEpub;
}
