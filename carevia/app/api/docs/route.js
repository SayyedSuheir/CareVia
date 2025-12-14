import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';

// Swagger options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Next.js API',
      version: '1.0.0',
      description: 'Auto-generated API documentation',
    },
  },
  apis:[
  "./app/api/admin/donations/route.js",
  "./app/api/admin/reports/route.js",
  "./app/api/admin/stats/route.js",
  "./app/api/users/{id}/route.js",
  "./app/api/auth/google/route.js",
  "./app/api/auth/logout/route.js",
  "./app/api/auth/session/route.js",
  "./app/api/docs/route.js",
  "./app/api/filters/location/route.js",
  "./app/api/filters/typefilter/route.js",
  "./app/api/login/route.js",
  "./app/api/postsaction/{id}/route.js",
  "./app/api/postsaction/all/route.js",
  "./app/api/postsaction/createPost/route.js",
  "./app/api/postsaction/user/route.js",
  "./app/api/register/route.js",
  "./app/api/requests/requestedItem/route.js",
  "./app/api/requests/user/route.js"
] // look for JSDoc comments in your API routes
};

const swaggerSpec = swaggerJsdoc(options);

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
