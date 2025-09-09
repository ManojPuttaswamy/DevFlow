import { Prisma } from "@prisma/client";


// Optimized project queries
export const optimizedProjectSelect = {
    id: true,
    title: true,
    description: true,
    technologies: true,
    category: true,
    status: true,
    views: true,
    likes: true,
    featured: true,
    createdAt: true,
    githubUrl: true,
    liveUrl: true,
    images: true,
    author: {
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        title: true,
      }
    },
    _count: {
      select: {
        reviews: {
          where: { status: 'APPROVED' }
        }
      }
    }
  } satisfies Prisma.ProjectSelect;
  
  // Optimized user queries
  export const optimizedUserSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    bio: true,
    avatar: true,
    title: true,
    company: true,
    location: true,
    skills: true,
    profileViews: true,
    createdAt: true,
  } satisfies Prisma.UserSelect;
  
  // Optimized notification queries
  export const optimizedNotificationSelect = {
    id: true,
    title: true,
    message: true,
    type: true,
    read: true,
    createdAt: true,
    project: {
      select: {
        id: true,
        title: true,
      }
    },
    triggeredBy: {
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
      }
    }
  } satisfies Prisma.NotificationSelect;

  export class PerformanceMonitor {
    static measureQuery<T>(
      operation: string,
      fn: () => Promise<T>
    ): Promise<T> {
      const start = Date.now();
      
      return fn().then(
        (result) => {
          const duration = Date.now() - start;
          if (duration > 1000) {
            console.warn(`Slow operation: ${operation} took ${duration}ms`);
          }
          return result;
        },
        (error) => {
          const duration = Date.now() - start;
          console.error(`Failed operation: ${operation} failed after ${duration}ms`, error);
          throw error;
        }
      );
    }
  }