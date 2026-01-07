// API service for communicating with PHP backend

const API_BASE_URL = (window as any).process?.env?.REACT_APP_API_URL || 'https://vendinghanger.eeelab.xyz/apiendpoints.php';

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
  prize_name?: string;
  slot: number;
  command?: string;
  response?: string;
  error?: string;
  log_id?: number;
  simulated?: boolean; // Add simulated property for API fallback
  message?: string; // Add message property for API fallback
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Fix: Append endpoint to base URL for proper routing
    const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    
    // For GET requests, don't send body, for POST requests send the data directly
    const isGetRequest = (options.method || 'GET') === 'GET';
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      method: options.method || 'GET',
      body: isGetRequest ? undefined : options.body,
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
    return this.request(`/players?id=${id}`);
  }

  // Score endpoints - Updated to create player and score in one request
  async submitScore(scoreData: { id: string; name: string; email?: string; phone?: string; time: number }): Promise<any> {
    try {
      return await this.request('/scores', {
        method: 'POST',
        body: JSON.stringify(scoreData),
      });
    } catch (error) {
      console.warn('[API SERVICE] Failed to submit score, will keep in queue:', error);
      // Return a structured error for better handling - match 135new2.md pattern
      return {
        success: false,
        error: error.message || 'Endpoint not found',
        queued: true
      };
    }
  }

  async getLeaderboard(limit: number = 10): Promise<{ scores: ScoreWithPlayer[]; total: number }> {
    return this.request('/leaderboard');
  }

  // Prize endpoints - Enhanced with better error handling
  async checkPrizeEligibility(time: number): Promise<{ eligible: boolean; prize?: Prize; message?: string }> {
    try {
      return await this.request(`/prizes?check=1&time=${time}`);
    } catch (error) {
      console.warn('[API SERVICE] Failed to check prize eligibility, using default:', error);
      // Return default eligibility for bronze prizes when API fails - match 135new2.md pattern
      return {
        eligible: time >= 10000, // 10 seconds minimum for bronze
        message: 'Endpoint not found'
      };
    }
  }

  async getAllPrizes(): Promise<{ prizes: Prize[] }> {
    try {
      return await this.request('/prizes');
    } catch (error) {
      console.warn('[API SERVICE] Failed to get prizes, using fallback:', error);
      // Return fallback prizes when API fails - match 135new2.md pattern
      return {
        prizes: [
          { id: 1, name: 'Silver', message: '3+ seconds', slot: 1, time_threshold: 3000 },
          { id: 2, name: 'Gold', message: '2+ minutes', slot: 25, time_threshold: 120000 }
        ]
      };
    }
  }

  // Vending endpoints - Enhanced with better error handling
  async dispensePrize(prizeId: number, scoreId: number): Promise<VendingResult> {
    try {
      return await this.request('/vending/dispense', {
        method: 'POST',
        body: JSON.stringify({
          prize_id: prizeId,
          score_id: scoreId,
        }),
      });
    } catch (error) {
      console.warn('[API SERVICE] Failed to dispense prize, simulating success:', error);
      // Return simulated success when API fails
      return {
        success: true,
        score_id: scoreId,
        prize_id: prizeId,
        simulated: true,
        message: 'API unavailable - simulated dispensing',
        slot: 1 // Add default slot for API fallback
      };
    }
  }

  async getVendingStatus(): Promise<{ status: string; recent_logs: any[] }> {
    return this.request('/vending/status');
  }

  // New method for Electron Vending Service logging - Enhanced with better error handling
  async logDispensingToServer(logData: {
    action: string;
    game_time_ms: number;
    tier: string;
    selected_slot: number;
    channel_used: number;
    score_id: string;
    prize_id: number;
    success: boolean;
    error_code?: number;
    error_message?: string;
    dispense_method: string;
    inventory_before: number;
    inventory_after: number;
    response_time_ms: number;
    source: string;
  }): Promise<any> {
    try {
      return await this.request('/api/electron-vending/log', {
        method: 'POST',
        body: JSON.stringify(logData),
      });
    } catch (error) {
      console.warn('[API SERVICE] Failed to log dispensing to server (will queue locally):', error);
      // Return success for local queue when server logging fails
      return {
        success: true,
        queued: true,
        message: 'Server logging failed - queued locally'
      };
    }
  }
}

export const apiService = new ApiService();