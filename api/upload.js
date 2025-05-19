import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'File parsing failed' });
    }

    try {
      const file = files.plan;
      const fileBuffer = await fs.readFile(file.filepath);
      const base64PDF = fileBuffer.toString('base64');

      // 🔁 Make the external API call from the backend (no CORS issues)
      const aitopiaRes = await fetch('https://extensions.aitopia.ai/ai/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AITOPIA_API_KEY}`  // Set in Vercel environment
        },
        body: JSON.stringify({
          prompt: 'Extract an electrical material list from this PDF.',
          input: base64PDF
        })
      });

      const aitopiaData = await aitopiaRes.json();

      res.status(200).json({ materialList: aitopiaData });
    } catch (e) {
      console.error('Processing error:', e);
      res.status(500).json({ error: 'Processing failed' });
    }
  });
}
