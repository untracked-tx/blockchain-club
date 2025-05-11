const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const API_KEY = process.env.z6MkvX4xwNK9XkBvwu8q3GU6Cei6H76FERKKzqDEQ6svSBPj; // Use environment variable for API key
if (!API_KEY) {
  throw new Error("API key is missing. Please set NFT_STORAGE_API_KEY in your .env file.");
}

const client = new NFTStorage({ token: API_KEY });

async function uploadTokenMetadata() {
  const metadataDir = path.resolve(__dirname, '../metadata'); // Resolve absolute path for metadata directory
  const imagesDir = path.resolve(__dirname, '../images'); // Resolve absolute path for images directory

  if (!fs.existsSync(metadataDir)) {
    throw new Error(`Metadata directory not found: ${metadataDir}`);
  }

  const files = fs.readdirSync(metadataDir);

  for (const fileName of files) {
    try {
      const filePath = path.join(metadataDir, fileName);
      const metadata = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const imagePath = path.join(imagesDir, metadata.image);
      if (!fs.existsSync(imagePath)) {
        console.error(`Image file not found: ${imagePath}`);
        continue;
      }

      const imageFile = new File([fs.readFileSync(imagePath)], metadata.image, { type: 'image/png' });
      metadata.image = imageFile;

      const result = await client.store(metadata);
      console.log(`${fileName} uploaded: ${result.url}`);
    } catch (error) {
      console.error(`Failed to upload ${fileName}:`, error);
    }
  }
}

///use nft.storage to upload metadata and images


console.log("Upload metadata to IPFS using your preferred service, then update the baseURI in the contract.");

uploadTokenMetadata().catch((error) => {
  console.error("An error occurred during the upload process:", error);
});
