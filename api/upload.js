import formidable from 'formidable';
import fs from 'fs/promises';
import { OpenAI } from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'File upload failed' });
    }

    try {
      const file = files.plan;
      const fileBuffer = await fs.readFile(file.filepath);
      const base64PDF = fileBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an estimator reading electrical plans.' },
          { role: 'user', content: 'Here is a base64-encoded PDF. Extract the electrical material list.' },
          { role: 'user', content: base64PDF },
        ],
      });

      const materialList = response.choices[0].message.content;
      res.status(200).json({ materialList });

    } catch (error) {
      console.error('OpenAI error:', error);
      res.status(500).json({ error: 'AI processing failed' });
    }
  });
}
