const express = require('express');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/public', async (req,res) => {
  try {
    const { search, status } = req.query;
    const filter = { isPublic: true, status: { $in: status ? [status] : ['published','in_progress','completed'] } };
    if (search) filter.name = { $regex: search, $options: 'i' };
    res.json(await Tournament.find(filter).select('-categories.bracket').sort({ startDate: -1 }).limit(50));
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.get('/my', auth, async (req,res) => {
  try { res.json(await Tournament.find({ organizer: req.user._id }).sort({ createdAt: -1 })); }
  catch(e){ res.status(500).json({ error: e.message }); }
});

router.get('/staff', auth, async (req,res) => {
  try { res.json(await Tournament.find({ 'staff.user': req.user._id }).sort({ createdAt: -1 })); }
  catch(e){ res.status(500).json({ error: e.message }); }
});

router.get('/:id', auth, async (req,res) => {
  try {
    const t = await Tournament.findById(req.params.id).populate('staff.user','name email role');
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req,res) => {
  try {
    const t = await Tournament.create({
      ...req.body,

      // attach automatically
      organization: req.user.organizationId || req.user.organization,
      organizer: req.user._id
    });

    res.status(201).json({
      success: true,
      tournament: t
    });

  } catch(e){
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', auth, upload.fields([{name:'logo',maxCount:1}]), async (req,res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!t) return res.status(404).json({ error: 'Not owner' });
    const data = JSON.parse(req.body.data || '{}');
    if (req.files?.logo?.[0]) data.logo = `/uploads/${req.files.logo[0].filename}`;
    res.json(await Tournament.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.put('/:id/publish', auth, async (req,res) => {
  try { res.json(await Tournament.findOneAndUpdate({ _id: req.params.id, organizer: req.user._id }, { status: 'published' }, { new: true })); }
  catch(e){ res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req,res) => {
  try { await Tournament.findOneAndDelete({ _id: req.params.id, organizer: req.user._id }); res.json({ message: 'Deleted' }); }
  catch(e){ res.status(500).json({ error: e.message }); }
});

// Staff management
router.post('/:id/staff', auth, async (req,res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!t) return res.status(403).json({ error: 'Not owner' });
    const { email, role, permissions } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found — they must register first' });
    t.staff = t.staff.filter(s => s.user?.toString() !== user._id.toString());
    t.staff.push({ user: user._id, name: user.name, email: user.email, role, permissions: permissions || [], addedAt: new Date() });
    await t.save();
    res.json(t);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.put('/:id/staff/:userId', auth, async (req,res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!t) return res.status(403).json({ error: 'Not owner' });
    const member = t.staff.find(s => s.user?.toString() === req.params.userId);
    if (!member) return res.status(404).json({ error: 'Staff not found' });
    const { role, permissions } = req.body;
    if (role) member.role = role;
    if (permissions) member.permissions = permissions;
    await t.save();
    res.json(t);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.delete('/:id/staff/:userId', auth, async (req,res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!t) return res.status(403).json({ error: 'Not owner' });
    t.staff = t.staff.filter(s => s.user?.toString() !== req.params.userId);
    await t.save();
    res.json(t);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

// Category management
router.post('/:id/categories', auth, async (req,res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!t) return res.status(403).json({ error: 'Not owner' });
    t.categories.push(req.body); await t.save(); res.json(t);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.put('/:id/categories/:catId', auth, async (req,res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!t) return res.status(403).json({ error: 'Not owner' });
    const cat = t.categories.id(req.params.catId);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    Object.assign(cat, req.body); await t.save(); res.json(t);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.delete('/:id/categories/:catId', auth, async (req,res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!t) return res.status(403).json({ error: 'Not owner' });
    t.categories = t.categories.filter(c => c._id.toString() !== req.params.catId);
    await t.save(); res.json(t);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

module.exports = router;
