const openAPIDocument = {
  openapi: "3.0.3",
  info: {
    title: "MERN E-commerce Platform API",
    version: "1.0.0",
    description: "API documentation for the MERN E-commerce Platform."
  },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Express server"
      }
    ],
    tags: [
        {
            name: "Products",
            description: "Operations related to products"
        }
    ],
    paths: {
        "/health": {
            get: {
                tags: ["Health Check"],
                summary: "Check the health of the API",
                responses: {
                    200: {
                        description: "API is healthy"
                    },
                    503: {
                        description: "API is not healthy"
                    }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
};

module.exports = openAPIDocument;
