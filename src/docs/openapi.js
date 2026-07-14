const openAPIDocument = {
  openapi: "3.0.3",
  info: {
    title: "MERN E-commerce Platform API",
    version: "1.0.0",
    description: "API documentation for the MERN E-commerce Platform."
  },
    servers: [
      {
        url: "http://localhost:5000",
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
        },
        "/api/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register a new user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RegisterUser"
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "User registered successfully"
                    },
                    409: {
                        description: "User already exists"
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
        },
        parameters: {
            name: "Id",
            in: "path",
            description: "ID of the resource",
            required: true,
            schema: {
                type: "string"
            }
        },
        schemas: {
            RegisterUser: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                    name: {
                        type: "string",
                        description: "The user's name"
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "The user's email"
                    },
                    password: {
                        type: "string",
                        format: "password",
                        description: "The user's password"
                    }
                }
            }
        }
    }
};

module.exports = openAPIDocument;
