const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chat = async (systemPrompt, userContent) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
};

exports.solveDoubt = async (req, res) => {
  const { question, imageBase64 } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  const systemPrompt = `You are an expert Indian school teacher helping students from Class 6 to 12. 
Answer clearly with proper steps, examples, and diagrams descriptions. Use simple language. 
Format your answers using markdown with proper headings, bullet points, and bold text.`;

  let userContent;
  if (imageBase64) {
    userContent = [
      { type: 'text', text: question },
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
    ];
  } else {
    userContent = question;
  }

  const answer = await chat(systemPrompt, typeof userContent === 'string' ? userContent : JSON.stringify(userContent));
  res.json({ success: true, data: { answer } });
};

exports.summarizeNotes = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

  const systemPrompt = `You are an expert at summarizing study notes for Indian school students.
Create a concise, well-structured summary using:
- Key points as bullet points
- Important terms in **bold**
- Short, memorable sentences
- Exam-focused highlights
Format in markdown.`;

  const summary = await chat(systemPrompt, `Summarize these notes:\n\n${text}`);
  res.json({ success: true, data: { summary } });
};

exports.homeworkHelper = async (req, res) => {
  const { subject, question } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

  const systemPrompt = `You are a helpful homework assistant for Indian school students.
Provide step-by-step solutions with clear explanations.
For math: show all working steps.
For science: explain concepts clearly.
For languages: explain grammar rules.
Be encouraging and educational.`;

  const result = await chat(systemPrompt, `Subject: ${subject || 'General'}\n\nQuestion: ${question}`);
  const parts = result.split('\n\n');
  res.json({ success: true, data: { answer: parts[0] || result, explanation: parts.slice(1).join('\n\n') || '' } });
};

exports.essayWriter = async (req, res) => {
  const { topic, wordCount = 300, style = 'academic' } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

  const systemPrompt = `You are an expert essay writer for Indian school students.
Write a ${style} essay that:
- Has a clear introduction, body paragraphs, and conclusion
- Uses appropriate vocabulary for school level
- Is factually accurate and well-structured
- Is approximately ${wordCount} words
Format in markdown with clear paragraph breaks.`;

  const essay = await chat(systemPrompt, `Write a ${style} essay on: "${topic}"`);
  res.json({ success: true, data: { essay } });
};

exports.generateQuiz = async (req, res) => {
  const { subject, class: cls, chapter, count = 5 } = req.body;

  const systemPrompt = `You are a quiz generator for Indian school students.
Generate exactly ${count} multiple choice questions.
Return ONLY valid JSON array, no other text:
[{"question":"...","options":["A","B","C","D"],"correctOption":0,"explanation":"..."}]
The correctOption is the 0-based index of the correct answer.`;

  const raw = await chat(systemPrompt, `Generate ${count} MCQs for Class ${cls} ${subject}, Chapter: ${chapter}`);

  let questions;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    questions = JSON.parse(cleaned);
  } catch {
    questions = [];
  }

  res.json({ success: true, data: { questions } });
};
