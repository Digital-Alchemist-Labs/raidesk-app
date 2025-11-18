import { IStorageAdapter, SessionState } from '@/types';

/**
 * SQL Storage Adapter (Stub for future implementation)
 * This can be integrated with PostgreSQL, MySQL, or SQLite
 * using libraries like Prisma, Drizzle ORM, or Knex.js
 */
export class SQLAdapter implements IStorageAdapter {
  private connectionString: string;

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.DATABASE_URL || '';
  }

  async saveSession(session: SessionState): Promise<void> {
    // TODO: Implement SQL storage
    // Example implementation with Prisma:
    // await prisma.session.upsert({
    //   where: { sessionId: session.sessionId },
    //   create: { ...session },
    //   update: { ...session },
    // });
    
    console.warn('SQLAdapter.saveSession not implemented yet');
    throw new Error('SQL storage not implemented. Use LocalStorageAdapter or implement this method.');
  }

  async loadSession(sessionId: string): Promise<SessionState | null> {
    // TODO: Implement SQL storage
    // Example implementation with Prisma:
    // const session = await prisma.session.findUnique({
    //   where: { sessionId },
    // });
    // return session;
    
    console.warn('SQLAdapter.loadSession not implemented yet');
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // TODO: Implement SQL storage
    // Example implementation with Prisma:
    // await prisma.session.delete({
    //   where: { sessionId },
    // });
    
    console.warn('SQLAdapter.deleteSession not implemented yet');
  }

  async listSessions(): Promise<string[]> {
    // TODO: Implement SQL storage
    // Example implementation with Prisma:
    // const sessions = await prisma.session.findMany({
    //   select: { sessionId: true },
    // });
    // return sessions.map(s => s.sessionId);
    
    console.warn('SQLAdapter.listSessions not implemented yet');
    return [];
  }
}

/**
 * SQL Schema suggestion (for reference):
 * 
 * CREATE TABLE sessions (
 *   session_id VARCHAR(255) PRIMARY KEY,
 *   current_step INTEGER NOT NULL,
 *   messages JSONB NOT NULL,
 *   concept TEXT,
 *   classification JSONB,
 *   category JSONB,
 *   purpose_mechanism JSONB,
 *   plans JSONB,
 *   selected_plan JSONB,
 *   flowchart_nodes JSONB,
 *   flowchart_edges JSONB,
 *   show_summary BOOLEAN DEFAULT false,
 *   show_flowchart BOOLEAN DEFAULT false,
 *   is_loading BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * CREATE INDEX idx_sessions_updated ON sessions(updated_at DESC);
 */


