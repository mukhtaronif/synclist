// Parse Apple Music playlist files (.txt or .xml)

export const parseAppleMusicFile = async (file) => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xml')) {
    return await parseXMLFile(file);
  } else if (fileName.endsWith('.txt')) {
    return await parseTXTFile(file);
  } else {
    throw new Error('Unsupported file format. Please upload a .txt or .xml file exported from Apple Music.');
  }
};

// Parse XML plist format from Apple Music
const parseXMLFile = async (file) => {
  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');

  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Failed to parse XML file. Please ensure it\'s a valid Apple Music export.');
  }

  const tracks = [];

  // Find all track dictionaries in the XML
  // Apple Music exports use a plist structure with nested <dict> elements
  const trackDicts = xmlDoc.querySelectorAll('dict > dict > dict');

  trackDicts.forEach((trackDict) => {
    const track = {};
    const keys = trackDict.querySelectorAll('key');

    keys.forEach((key) => {
      const keyName = key.textContent;
      const valueElement = key.nextElementSibling;

      if (valueElement) {
        if (keyName === 'Name') {
          track.name = valueElement.textContent;
        } else if (keyName === 'Artist') {
          track.artist = valueElement.textContent;
        }
      }
    });

    // Only add tracks that have both name and artist
    if (track.name && track.artist) {
      tracks.push({
        name: track.name,
        artist: track.artist,
        id: `${track.artist}-${track.name}-${Date.now()}-${Math.random()}`,
      });
    }
  });

  if (tracks.length === 0) {
    throw new Error('No tracks found in the XML file. Please ensure it\'s a valid Apple Music playlist export.');
  }

  return tracks;
};

// Parse tab-separated text format from Apple Music
const parseTXTFile = async (file) => {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('The text file is empty.');
  }

  // First line should be the header
  const header = lines[0].split('\t');

  // Find the indices for Name and Artist columns
  const nameIndex = header.findIndex(col =>
    col.toLowerCase().includes('name') || col.toLowerCase().includes('title')
  );
  const artistIndex = header.findIndex(col =>
    col.toLowerCase().includes('artist')
  );

  if (nameIndex === -1 || artistIndex === -1) {
    throw new Error('Could not find Name and Artist columns in the text file. Please ensure the file has proper headers.');
  }

  const tracks = [];

  // Parse each line after the header
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    const name = columns[nameIndex]?.trim();
    const artist = columns[artistIndex]?.trim();

    if (name && artist) {
      tracks.push({
        name,
        artist,
        id: `${artist}-${name}-${Date.now()}-${Math.random()}`,
      });
    }
  }

  if (tracks.length === 0) {
    throw new Error('No valid tracks found in the text file.');
  }

  return tracks;
};
