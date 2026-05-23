const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity');

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, workspaceId, assignedTo, priority, dueDate, tags } = req.body;
    if (!title || !projectId || !workspaceId)
      return res.status(400).json({ message: 'title, projectId, workspaceId required' });

    const task = await Task.create({
      title, description, project: projectId, workspace: workspaceId,
      assignedTo: assignedTo || null, createdBy: req.user._id,
      priority, dueDate, tags
    });

    await Activity.create({
      workspace: workspaceId, user: req.user._id,
      action: `Created task "${title}"`, entity: 'task', entityId: task._id,
      meta: { priority, dueDate }
    });

    await task.populate('assignedTo createdBy', 'name email');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    // Member can only update status of their own task
    const workspace = await Workspace.findById(task.workspace);
    const member = workspace?.members.find(m => m.user.toString() === req.user._id.toString());
    const isOwner = workspace?.owner.toString() === req.user._id.toString();
    const isAdmin = isOwner || member?.role === 'admin';

    if (!isAdmin) {
      const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
      if (!isAssigned) return res.status(403).json({ message: 'Not authorized' });
      // Member can only update status
      if (Object.keys(req.body).some(k => k !== 'status'))
        return res.status(403).json({ message: 'Members can only update task status' });
    }

    const oldStatus = task.status;
    Object.assign(task, req.body);
    await task.save();
    await task.populate('assignedTo createdBy', 'name email');

    if (req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        workspace: task.workspace, user: req.user._id,
        action: `Updated "${task.title}" status to ${req.body.status}`,
        entity: 'task', entityId: task._id
      });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    const workspace = await Workspace.findById(task.workspace);
    const member = workspace?.members.find(m => m.user.toString() === req.user._id.toString());
    const isOwner = workspace?.owner.toString() === req.user._id.toString();
    if (!isOwner && member?.role !== 'admin')
      return res.status(403).json({ message: 'Admin access required' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};