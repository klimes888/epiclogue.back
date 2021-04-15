import swaggerJSDoc from 'swagger-jsdoc'

// Swagger setting
const swaggerDefinition = {
  info: {
    // API informations (required)
    title: 'epiclogue API', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'epiclogue service API', // Description (optional)
  },
  host: 'api.epiclogue.com', // Host (optional)
  basePath: '/', // Base path (optional)
  schemes: ['https'],
}

const options = {
  // Import swaggerDefinitions
  swaggerDefinition,
  // Path to the API docs
  apis: ['./apidoc.yaml'],
}

export const swaggerSpec = swaggerJSDoc(options)
