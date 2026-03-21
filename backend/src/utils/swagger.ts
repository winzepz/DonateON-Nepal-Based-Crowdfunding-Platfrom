import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DonateOn API Documentation',
            version: '2.0.0',
            description: 'API routing and endpoints for the DonateOn Platform V2',
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Generate from JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);
