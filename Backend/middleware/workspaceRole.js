const Workspace = require('../models/Workspace');

exports.requireAdmin = async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.workspaceId || req.body.workspaceId);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

  const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
  const isOwner = workspace.owner.toString() === req.user._id.toString();

  if (!isOwner && member?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  req.workspace = workspace;
  next();
};

exports.requireMember = async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.workspaceId || req.body.workspaceId);
  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

  const isMember = workspace.members.some(m => m.user.toString() === req.user._id.toString());
  const isOwner = workspace.owner.toString() === req.user._id.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({ message: 'Not a workspace member' });
  }
  req.workspace = workspace;
  next();
};