import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { type Express } from 'express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Media API',
            version: '1.0.0',
            description: 'Documentation for Media API with secure file hosting',
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
                        content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } }, required: ['username', 'email', 'password'] } } }
                    },
                    responses: { '201': { description: 'User created successfully' }, '400': { description: 'Validation error' } }
                }
            },
            '/auth/login': {
                post: {
                    summary: 'User login',
                    tags: ['Auth'],
                    security: [],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } }
                    },
                    responses: { '200': { description: 'Successful login (returns token)' }, '401': { description: 'Invalid credentials' } }
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
                        content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, title: { type: 'string' }, description: { type: 'string' } } } } }
                    },
                    responses: { '201': { description: 'File uploaded successfully' }, '400': { description: 'Invalid file or format' }, '401': { description: 'Unauthorized' } }
                }
            },
            '/media/search': {
                get: {
                    summary: 'Secure file search',
                    tags: ['Media'],
                    parameters: [
                        { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search term for title or description' },
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'size', 'title'], default: 'createdAt' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
                    ],
                    responses: { '200': { description: 'Search results returned' }, '400': { description: 'Invalid query string' } }
                }
            },
            '/media': {
                get: {
                    summary: 'Get all public media files',
                    tags: ['Media'],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'size', 'title'], default: 'createdAt' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
                        { name: 'type', in: 'query', schema: { type: 'string', enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'] } }
                    ],
                    responses: { '200': { description: 'List of public media files' }, '401': { description: 'Unauthorized' } }
                }
            },
            '/media/my': {
                get: {
                    summary: 'Get current user media files',
                    tags: ['Media'],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'size', 'title'], default: 'createdAt' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
                        { name: 'type', in: 'query', schema: { type: 'string', enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'] } },
                        { name: 'visibility', in: 'query', schema: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'DELETED'] } }
                    ],
                    responses: { '200': { description: 'User personal files list' }, '401': { description: 'Unauthorized' } }
                }
            },
            '/media/{id}/stream': {
                get: {
                    summary: 'Stream file content by ID',
                    tags: ['Media'],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Media file unique identifier' }],
                    responses: { '200': { description: 'Binary stream content returned successfully' }, '401': { description: 'Unauthorized' }, '403': { description: 'Access denied (Private file)' }, '404': { description: 'File not found' } }
                }
            },
            '/media/{id}': {
                patch: {
                    summary: 'Update media file metadata',
                    tags: ['Media'],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string', maxLength: 255 }, description: { type: 'string', maxLength: 1000, nullable: true }, visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] } } } } }
                    },
                    responses: { '200': { description: 'Metadata updated successfully' }, '400': { description: 'Invalid request body' }, '403': { description: 'Forbidden (Not an owner or admin)' }, '404': { description: 'Media file not found' } }
                },
                delete: {
                    summary: 'Soft delete media file from server',
                    tags: ['Media'],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                    responses: { '200': { description: 'File deleted successfully' }, '403': { description: 'Forbidden (Not an owner or admin)' }, '404': { description: 'Media file not found' }, '500': { description: 'Failed to clean up storage file' } }
                }
            },
            '/admin/users': {
                get: {
                    summary: 'Get all registered users (Admin only)',
                    tags: ['Admin'],
                    responses: { '200': { description: 'List of all system users fetched successfully' }, '401': { description: 'Unauthorized (Token missing)' }, '403': { description: 'Access denied (Requires ADMIN role)' } }
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
    console.log(`Swagger documents: http://localhost:${port}/api-docs`);
};