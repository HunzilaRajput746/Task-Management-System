import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Team from './pages/Team';

import api from './services/api';

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Global Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [presetProjectId, setPresetProjectId] = useState(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const refreshGlobalMeta = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users'),
      ]);
      if (projRes.data.success) setAllProjects(projRes.data.data);
      if (usersRes.data.success) setAllUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to load global meta', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshGlobalMeta();
    }
  }, [user, location.pathname]);

  const handleOpenNewTask = (projectId = null) => {
    setPresetProjectId(projectId);
    setEditingTask(projectId ? { project: projectId } : null);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark-canvas text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenNewProject={handleOpenNewProject}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          onOpenNewProject={handleOpenNewProject}
          onOpenNewTask={() => handleOpenNewTask()}
        />

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onOpenNewProject={handleOpenNewProject}
                  onOpenNewTask={() => handleOpenNewTask()}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <Projects
                  onOpenNewProject={handleOpenNewProject}
                  onEditProject={handleEditProject}
                />
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProjectDetail
                  onOpenNewTask={handleOpenNewTask}
                  onTaskClick={handleTaskClick}
                  onEditProject={handleEditProject}
                />
              }
            />
            <Route
              path="/tasks"
              element={
                <Tasks
                  onOpenNewTask={() => handleOpenNewTask()}
                  onTaskClick={handleTaskClick}
                />
              }
            />
            <Route path="/team" element={<Team />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setPresetProjectId(null);
        }}
        task={editingTask}
        projects={allProjects}
        users={allUsers}
        onTaskUpdated={() => {
          refreshGlobalMeta();
          // Reload current route components smoothly
          window.dispatchEvent(new Event('taskUpdated'));
        }}
        onTaskDeleted={() => {
          refreshGlobalMeta();
          window.dispatchEvent(new Event('taskUpdated'));
        }}
      />

      {/* Global Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        users={allUsers}
        onProjectSaved={() => {
          refreshGlobalMeta();
          window.dispatchEvent(new Event('projectUpdated'));
        }}
        onProjectDeleted={() => {
          refreshGlobalMeta();
          window.dispatchEvent(new Event('projectUpdated'));
        }}
      />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
