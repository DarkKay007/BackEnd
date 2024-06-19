import { collection as projectCollection, ObjectId } from '../models/projectModels.js';

// Obtener todos los proyectos del usuario
const getAllProjects = async (req, res) => {
  try {
    const user = req.user;
    let projects;

    if (user.rol === 'Administrador') {
      projects = await projectCollection.find().toArray();
    } else {
      projects = await projectCollection.find({
        $or: [
          { assignedTo: user._id.toString() },
          { createdBy: user._id.toString() },
        ],
      }).toArray();
    }

    res.json(projects);
  } catch (error) {
    console.error(`Error getting projects: ${error}`);
    res.status(500).send('Internal Server Error');
  }
};

// Obtener un proyecto por su ID
const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await projectCollection.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).send('Project not found');
    }

    // Verificar permisos
    if (req.user.rol !== 'Administrador' && project.createdBy !== req.user._id.toString() && !project.assignedTo.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error(`Error getting project by ID: ${error}`);
    res.status(500).send('Internal Server Error');
  }
};

// Crear un nuevo proyecto
const createProject = async (req, res) => {
  const projectData = req.body;

  try {
    projectData.createdBy = req.user._id.toString();
    const result = await projectCollection.insertOne(projectData);

    // Acceder correctamente al proyecto insertado
    const createdProject = await projectCollection.findOne({ _id: result.insertedId });

    res.status(201).json(createdProject);
  } catch (error) {
    console.error(`Error creating project: ${error}`);
    res.status(500).send('Internal Server Error');
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const updatedProjectData = req.body;

  try {
    console.log(`Received update request for project ID: ${id}`);
    console.log('Updated project data:', updatedProjectData);

    const project = await projectCollection.findOne({ _id: new ObjectId(id) });

    if (!project) {
      console.log('Project not found');
      return res.status(404).send('Project not found');
    }

    // Verificar permisos
    if (req.user.rol !== 'Administrador' && project.createdBy !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateResult = await projectCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProjectData }
    );

    if (updateResult.modifiedCount === 0) {
      console.log('No changes made to the project');
      return res.status(304).send('No changes made to the project');
    }

    res.status(200).send('Project updated successfully');
  } catch (error) {
    console.error(`Error updating project: ${error}`);
    res.status(500).send('Internal Server Error');
  }
};


// Eliminar un proyecto
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await projectCollection.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).send('Project not found');
    }

    // Verificar permisos
    if (req.user.rol !== 'Administrador' && project.createdBy !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await projectCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).send('Project deleted successfully');
  } catch (error) {
    console.error(`Error deleting project: ${error}`);
    res.status(500).send('Internal Server Error');
  }
};

// Asignar usuarios a un proyecto
const assignUsersToProject = async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  try {
    const project = await projectCollection.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).send('Project not found');
    }

    await projectCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { assignedTo: userIds } }
    );

    res.status(200).send('Users assigned to project successfully');
  } catch (error) {
    console.error(`Error assigning users to project: ${error}`);
    res.status(500).send('Internal Server Error');
  }
};

export { getAllProjects, getProjectById, createProject, updateProject, deleteProject, assignUsersToProject };
