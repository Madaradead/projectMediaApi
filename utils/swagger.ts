import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { type Express } from 'express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Media API',
            version: '1.0.0',
            description: 'Documentation for Media API',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],

        paths: {
            '/auth/register': {
                post: {
                    summary: 'Register a new user',
                    tags: ['Auth'],
                    security: [],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } } } }
                    },
                    responses: { '201': { description: 'User created successfully' } }
                }
            },
            '/auth/login': {
                post: {
                    summary: 'User login',
                    tags: ['Auth'],
                    security: [],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } }
                    },
                    responses: { '200': { description: 'Successful login (returns token)' } }
                }
            },
            '/auth/me': {
                get: {
                    summary: 'Get current user profile',
                    tags: ['Auth'],
                    responses: { '200': { description: 'Successful response' }, '401': { description: 'Unauthorized' } }
                }
            },
            '/media/upload': {
                post: {
                    summary: 'Upload a media file',
                    tags: ['Media'],
                    requestBody: {
                        required: true,
                        content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } }
                    },
                    responses: { '201': { description: 'File uploaded successfully' } }
                }
            },
            '/media/search': {
                get: {
                    summary: 'Secure file search',
                    tags: ['Media'],
                    parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
                    responses: { '200': { description: 'Search results' } }
                }
            }
        }

    },
    apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    const port = process.env.PORT || 5000;
    console.log('Swagger documents: http://localhost:5000/api-docs');
};