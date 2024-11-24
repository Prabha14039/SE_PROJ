const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/academa', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const projectSchema = new mongoose.Schema({
  projectName: String,
  projectDescription: String,
  teamSize: Number,
});


const Project = mongoose.model('Project', projectSchema);

// Updated Application Schema with status
const applicationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  name: String,
  email: String,
  experience: String,
  Year: String,
  Cgpa: [Number],
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
});

const Application = mongoose.model('Application', applicationSchema);

// Existing endpoints...
app.get('/api/projects/:id/applications', async (req, res) => {
  try {
    const applications = await Application.find({ projectId: req.params.id });
    res.json(applications);
  } catch (err) {
    res.status(500).send('Error fetching applications');
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).send('Error saving application.');
  }
});

app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Received status update request:', status); // Log the received status

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).send('Invalid status');
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).send('Application not found');
    }

    application.status = status;
    application.notificationSent = false;
    await application.save();

    console.log(`Notification to ${application.email}: Your application has been ${status}`);

    application.notificationSent = true;
    await application.save();

    res.json(application);
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).send('Error updating application status');
  }
});


// Existing project endpoints...
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).send('Error fetching projects');
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { projectName, projectDescription, teamSize } = req.body;
    const newProject = new Project({ projectName, projectDescription, teamSize });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    res.status(500).send('Error saving project');
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid project ID format');
  }

  try {
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).send('Project not found');
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).send('Internal server error');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});