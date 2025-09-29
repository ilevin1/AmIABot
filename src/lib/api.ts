// API client for game interactions
export class GameAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/game';
  }

  async joinQueue(playerId: string) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'joinQueue',
        playerId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to join queue');
    }

    return response.json();
  }

  async sendMessage(sessionId: string, playerId: string, content: string) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId,
        playerId,
        content
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async makeGuess(sessionId: string, playerId: string, guess: 'human' | 'bot') {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'makeGuess',
        sessionId,
        playerId,
        guess
      })
    });

    if (!response.ok) {
      throw new Error('Failed to make guess');
    }

    return response.json();
  }

  async getSession(sessionId: string) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getSession',
        sessionId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return response.json();
  }
}

export const gameAPI = new GameAPI();
