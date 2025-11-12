// API service for communicating with PHP backend

const API_BASE_URL = (window as any).process?.env?.REACT_APP_API_URL || 'https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php';

export interface Player {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  existing?: boolean;
}

export interface Prize {
  id: number;
  name: string;
  message: string;
  slot: number;
  time_threshold: number;
}

export interface ScoreWithPlayer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  time: number;
  prize?: {
    name: string;
    message: string;
  };
  created_at: string;
}

export interface VendingResult {
  success: boolean;
  score_id: number;
  prize_id: number;
  prize_name: string;
  slot: number;
  command?: string;
  response?: string;
  error?: string;
  log_id: number;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Player endpoints
  async createPlayer(playerData: { name: string; email?: string; phone?: string }): Promise<Player> {
    return this.request('/players', {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async getPlayer(id: number): Promise<Player> {
    return this.request(`/players/${id}`);
  }

  // Score endpoints
  async submitScore(scoreData: { player_id: number; time: number }): Promise<any> {
    return this.request('/scores', {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  }

  async getLeaderboard(limit: number = 10): Promise<{ scores: ScoreWithPlayer[]; total: number }> {
    return this.request(`/leaderboard`);
  }

  // Prize endpoints
  async checkPrizeEligibility(time: number): Promise<{ eligible: boolean; prize?: Prize; message?: string }> {
    return this.request(`/prizes?check=1&time=${time}`);
  }

  async getAllPrizes(): Promise<{ prizes: Prize[] }> {
    return this.request('/prizes');
  }

  // Vending endpoints
  async dispensePrize(prizeId: number, scoreId: number): Promise<VendingResult> {
    return this.request('/vending/dispense', {
      method: 'POST',
      body: JSON.stringify({
        prize_id: prizeId,
        score_id: scoreId,
      }),
    });
  }

  async getVendingStatus(): Promise<{ status: string; recent_logs: any[] }> {
    return this.request('/api/vending/status');
  }
}

export const apiService = new ApiService();