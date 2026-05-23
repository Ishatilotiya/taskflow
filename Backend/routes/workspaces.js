const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  createWorkspace, getWorkspaces, getWorkspace,
  addMember, removeMember, updateMemberRole
} = require('../controllers/workspaceController');

router.use(protect);
router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/members/:userId', updateMemberRole);

module.exports = router;