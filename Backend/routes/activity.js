const router = require('express').Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');

router.use(protect);
router.get('/:workspaceId', async (req, res) => {
  try {
    const logs = await Activity.find({ workspace: req.params.workspaceId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;