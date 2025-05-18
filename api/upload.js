import formidable from 'formidable';
import fs from 'fs';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    const filePath = files.plan.filepath;
    const fileData = fs.readFileSync(filePath);
    const base64PDF = fileData.toString('base64');

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an estimator reading electrical plans.' },
        { role: 'user', content: 'Here is a base64-encoded PDF. Extract the electrical material list.' },
        { role: 'user', content: base64PDF }
      ]
    });

    res.status(200).json({ materialList: gptResponse.choices[0].message.content });
  });
};
