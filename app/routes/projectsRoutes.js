import express from 'express';
import { authorize } from '../middleware/authMiddleware.js';
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject, assignUsersToProject } from '../controllers/projectControllers.js';

const projectRoutes = express.Router();

projectRoutes.post('/projects', authorize(['Usuario', 'Administrador']), createProject);
projectRoutes.get('/projects', authorize(['Usuario', 'Administrador']), getAllProjects);
projectRoutes.get('/projects/:id', authorize(['Usuario', 'Administrador']), getProjectById);
projectRoutes.put('/projects/:id', authorize([['Usuario', 'Administrador']]), updateProject);
projectRoutes.delete('/projects/:id', authorize(['Usuario', 'Administrador']), deleteProject);
projectRoutes.put('/projects/:id/assign', authorize(['Usuario', 'Administrador']), assignUsersToProject);

export default projectRoutes;
