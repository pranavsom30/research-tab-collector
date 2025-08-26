import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
});

const tabSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: String,
  note: String,
  tag: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Tab = mongoose.model('Tab', tabSchema);

// --- Register ---
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashed });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'User exists or invalid data' });
  }
});

// --- Login ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// --- Auth middleware ---
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Get user's tabs ---
app.get('/tabs', auth, async (req, res) => {
  const tabs = await Tab.find({ userId: req.userId });
  res.json(tabs);
});

// --- Save a tab ---
app.post('/save-tab', auth, async (req, res) => {
  const { url, note, tag } = req.body;
  const tab = await Tab.create({ userId: req.userId, url, note, tag });
  res.json(tab);
});

// --- Delete all user's tabs ---
app.delete('/tabs', auth, async (req, res) => {
  await Tab.deleteMany({ userId: req.userId });
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
