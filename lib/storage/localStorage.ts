import { IStorageAdapter, SessionState } from '@/types';

const SESSION_KEY_PREFIX = 'raidesk_session_';
const SESSION_LIST_KEY = 'raidesk_sessions';

export class LocalStorageAdapter implements IStorageAdapter {
  async saveSession(session: SessionState): Promise<void> {
    try {
      const key = `${SESSION_KEY_PREFIX}${session.sessionId}`;
      const serialized = JSON.stringify({
        ...session,
        createdAt: session.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
      });
      
      localStorage.setItem(key, serialized);
      
      // Update session list
      const sessions = await this.listSessions();
      if (!sessions.includes(session.sessionId)) {
        sessions.push(session.sessionId);
        localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Failed to save session to localStorage');
    }
  }

  async loadSession(sessionId: string): Promise<SessionState | null> {
    try {
      const key = `${SESSION_KEY_PREFIX}${sessionId}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }
      
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        messages: parsed.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = `${SESSION_KEY_PREFIX}${sessionId}`;
      localStorage.removeItem(key);
      
      // Update session list
      const sessions = await this.listSessions();
      const filtered = sessions.filter(id => id !== sessionId);
      localStorage.setItem(SESSION_LIST_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw new Error('Failed to delete session from localStorage');
    }
  }

  async listSessions(): Promise<string[]> {
    try {
      const data = localStorage.getItem(SESSION_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }
}


