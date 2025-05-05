const https = require('https');
const fs = require('fs');
const path = require('path');

// Create fonts directory if it doesn't exist
const fontDir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

// Font files to download
const fonts = [
  {
    url: 'https://cdn.fontcdn.ir/Font/Persian/Kalameh/Kalameh-Regular.woff2',
    fileName: 'Kalameh-Regular.woff2'
  },
  {
    url: 'https://cdn.fontcdn.ir/Font/Persian/Kalameh/Kalameh-Medium.woff2',
    fileName: 'Kalameh-Medium.woff2'
  },
  {
    url: 'https://cdn.fontcdn.ir/Font/Persian/Kalameh/Kalameh-Bold.woff2',
    fileName: 'Kalameh-Bold.woff2'
  }
];

// Download function
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filePath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Download fonts
async function downloadFonts() {
  console.log('Starting font downloads...');
  
  try {
    for (const font of fonts) {
      const filePath = path.join(fontDir, font.fileName);
      await downloadFile(font.url, filePath);
    }
    console.log('All fonts downloaded successfully!');
  } catch (error) {
    console.error('Error downloading fonts:', error);
  }
}

downloadFonts(); 