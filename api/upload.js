console.log('🔌 Upload endpoint received a request');


console.log('📦 Upload function triggered');



// updated to trigger Vercel function redeploy




import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'File parsing failed' });
    }

    try {
      if (!files.plan) {
        console.error('No plan file received');
        return res.status(400).json({ error: 'No file uploaded as "plan"' });
      }

      const file = files.plan;
      const fileBuffer = await fs.readFile(file.filepath);
      const base64PDF = fileBuffer.toString('base64');

      console.log('PDF received and converted to base64');

      const materialList = `You uploaded a file named: ${file.originalFilename}`;

      return res.status(200).json({ materialList });
    } catch (e) {
      console.error('Upload handler error:', e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
