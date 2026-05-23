const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity');

exports.createProject = async (req, res) => {
  try {
    const { title, description, color, workspaceId } = req.body;
    if (!title || !workspaceId) return res.status(400).json({ message: 'Title and workspaceId required' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    if (!isOwner && member?.role !== 'admin')
      return res.status(403).json({ message: 'Admin access required' });

    const project = await Project.create({
      title, description, color, workspace: workspaceId,
      createdBy: req.user._id,
      members: workspace.members.map(m => m.user)
    });

    await Activity.create({
      workspace: workspaceId, user: req.user._id,
      action: `Created project "${title}"`, entity: 'project', entityId: project._id
    });

    await project.populate('createdBy members', 'name email');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const projects = await Project.find({ workspace: workspaceId })
      .populate('createdBy members', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy members', 'name email')
      .populate('workspace', 'name');
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('createdBy members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};