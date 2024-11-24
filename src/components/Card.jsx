import React, { useState, useEffect } from 'react';
import { BiBrain, BiCodeAlt, BiData, BiPlus, BiTrash } from 'react-icons/bi';

const initialCourses = [
  {
    title: 'AI/ML',
    icon: <BiBrain />,
    description: 'Learn Artificial Intelligence and Machine Learning concepts.',
  },
  {
    title: 'Web Development',
    icon: <BiCodeAlt />,
    description: 'Dive into modern web development technologies.',
  },
  {
    title: 'Data Science',
    icon: <BiData />,
    description: 'Master data science techniques and tools.',
  },
];

const Card = () => {
  const [courses, setCourses] = useState(initialCourses); // Stores all cards, including initial ones and fetched projects
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    teamSize: '',
  });
  const [selectedProject, setSelectedProject] = useState(null); // To store the selected project details
  const [applications, setApplications] = useState([]); // To store applications for a selected project
  const [notification, setNotification] = useState(null); // To store notifications

  // Fetch courses from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then((response) => response.json())
      .then((data) => {
        // Transforming fetched projects to match card structure
        const projectCards = data.map((project) => ({
          id: project._id,
          title: project.projectName,
          description: project.projectDescription,
          icon: <BiData />, // Add an appropriate icon
        }));
        setCourses([...initialCourses, ...projectCards]);
      })
      .catch((err) => console.error('Error fetching projects:', err));
  }, []);

  // Fetch applications for a project
  const handleCardClick = (project) => {
    if (project.id) {
      setSelectedProject(project); // Set the selected project
      fetch(`http://localhost:5000/api/projects/${project.id}/applications`)
        .then((response) => response.json())
        .then((data) => setApplications(data)) // Set the applications for the selected project
        .catch((err) => console.error('Error fetching applications:', err));
    } else {
      setFormVisible(true); // Show the form when "Upload Project" card is clicked
      setSelectedProject(null); // Reset the selected project
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
  
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Expected JSON response, but got something else.');
      }
  
      const responseBody = await response.json();
      console.log('Response Body:', responseBody);
  
      if (response.ok) {
        const updatedApplication = responseBody;
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: updatedApplication.status } : app
        ));
  
        setNotification({
          type: 'success',
          message: `Application ${status} successfully. Notification sent to student.`
        });
  
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error(responseBody.message || 'Failed to update application status');
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to update application status: ${err.message}`
      });
    }
  };
  
  
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newProject = await response.json();
        const newCard = {
          id: newProject._id,
          title: newProject.projectName,
          description: newProject.projectDescription,
          icon: <BiData />, // Add an appropriate icon
        };
        setCourses((prevCourses) => [...prevCourses, newCard]);
        setFormVisible(false);
        setFormData({ projectName: '', projectDescription: '', teamSize: '' }); // Reset form
      } else {
        console.error('Failed to save project:', response.statusText);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCourses((prevCourses) => prevCourses.filter((course) => course.id !== id));
      } else {
        console.error('Failed to delete project:', response.statusText);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="card-container">
      {courses.map((course, index) => (
        <div className="card" key={index} onClick={() => handleCardClick(course)}>
          <div className="card-icon">{course.icon}</div>
          <h3 className="card-title">{course.title}</h3>
          {course.description && <p className="card-description">{course.description}</p>}
          {course.id && ( // Show delete button only for dynamic projects
            <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}>
              <BiTrash /> Delete
            </button>
          )}
        </div>
      ))}
      <div className="card" onClick={() => handleCardClick({})}>
        <div className="card-icon">
          <BiPlus />
        </div>
        <h3 className="card-title">Upload Project</h3>
      </div>

      {formVisible && (
        <div className="form-container">
          <h3>Upload Your Project</h3>
          <form onSubmit={handleFormSubmit}>
            <div>
              <label>Project Name:</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Project Description:</label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Team Size:</label>
              <input
                type="number"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {selectedProject && !formVisible && (
        <div className="project-details">
          <h3>Project Details: {selectedProject.title}</h3>
          <p>{selectedProject.description}</p>
          <h4>Applications</h4>
          <ul>
            {applications.length > 0 ? (
              applications.map((application, index) => (
                <li key={index}>
                  <p><strong>Name:</strong> {application.name}</p>
                  <p><strong>Email:</strong> {application.email}</p>
                  <p><strong>Experience:</strong> {application.experience}</p>
                  <p><strong>Year:</strong> {application.year}</p>
                  <p><strong>Cgpa:</strong> {application.cgpa}</p>
                  <p><strong>Message:</strong> {application.message}</p>
                  <button
                    onClick={() => handleApplicationStatus(application._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleApplicationStatus(application._id, 'rejected')}
                  >
                    Reject
                  </button>
                </li>
              ))
            ) : (
              <p>No applications yet</p>
            )}
          </ul>
        </div>
      )}

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Card;
