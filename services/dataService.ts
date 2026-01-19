
import { Score } from '../types';
import { apiService, ScoreWithPlayer } from './apiService';

const LEADERBOARD_KEY = 'hanger_game_leaderboard';
const SYNC_QUEUE_KEY = 'hanger_game_sync_queue';
const TOP_N_SCORES = 10;

// Convert API score format to app format
const convertApiScoreToAppScore = (apiScore: any): Score => ({
  id: apiScore.id.toString(),
  name: apiScore.player_name || apiScore.name,
  email: apiScore.email,
  phone: apiScore.phone,
  time: parseInt(apiScore.time),
});

export const getLeaderboard = async (): Promise<Score[]> => {
  try {
    // Try to get from API first
    const response = await apiService.getLeaderboard(TOP_N_SCORES);
    const scores = response.scores.map(convertApiScoreToAppScore);
    
    // Cache in localStorage for offline use
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores));
    } catch (error) {
      console.warn('Failed to cache leaderboard:', error);
    }
    
    return scores.sort((a, b) => b.time - a.time);
  } catch (error) {
    console.error('Failed to get leaderboard from API, falling back to cache:', error);
    
    // Fallback to localStorage
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      const scores: Score[] = data ? JSON.parse(data) : [];
      return scores.sort((a, b) => b.time - a.time);
    } catch (cacheError) {
      console.error('Failed to get leaderboard from cache:', cacheError);
      return [];
    }
  }
};

export const addScore = async (newScore: Score): Promise<Score[]> => {
  // Reject clearly invalid times early to avoid sending malformed data to the API
  if (newScore.time == null || Number.isNaN(Number(newScore.time)) || Number(newScore.time) <= 0) {
    console.warn('Rejected score with non-positive or invalid time:', newScore);
    try {
      const cached = await getLeaderboard();
      return cached;
    } catch (err) {
      return [];
    }
  }

  try {
    // First, create or get player
    const playerResponse = await apiService.createPlayer({
      name: newScore.name,
      email: newScore.email,
      phone: newScore.phone,
    });
    
    // Validate player response
    if (!playerResponse || !playerResponse.id) {
      console.error('Invalid player response when submitting score:', playerResponse);
      throw new Error('Invalid player response');
    }

    // Validate time
    if (newScore.time == null || Number.isNaN(Number(newScore.time))) {
      console.error('Attempted to submit score without a valid time:', newScore);
      throw new Error('Missing or invalid time');
    }

    // Log the exact payload we will send to the API
    console.log('Submitting score to API:', { id: newScore.id, name: newScore.name, email: newScore.email, phone: newScore.phone, time: newScore.time });

    // Then submit the score
    const scoreResponse = await apiService.submitScore({
      id: newScore.id,
      name: newScore.name,
      email: newScore.email,
      phone: newScore.phone,
      time: newScore.time,
    });
    
    // Refresh leaderboard
    return await getLeaderboard();
  } catch (error) {
    console.error('Failed to submit score to API, saving locally:', error);
    
    // Fallback to local storage
    const scores = await getLeaderboard();
    scores.push(newScore);
    const updatedScores = scores.sort((a, b) => b.time - a.time).slice(0, TOP_N_SCORES);
    
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedScores));
      console.log('Enqueuing score for sync (local fallback):', newScore);
      addToSyncQueue(newScore);
    } catch (cacheError) {
      console.error('Failed to save score to local storage:', cacheError);
    }
    
    return updatedScores;
  }
};

const getSyncQueue = (): Score[] => {
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get sync queue:', error);
    return [];
  }
};

const addToSyncQueue = (score: Score) => {
  const queue = getSyncQueue();
  // Log what we are adding so we can inspect malformed entries
  console.log('Adding to sync queue:', score);
  queue.push(score);
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    // Attempt to sync immediately if online
    if (navigator.onLine) {
      syncData();
    }
  } catch (error) {
    console.error('Failed to add to sync queue:', error);
  }
};

export const syncData = async (): Promise<void> => {
  const queue = getSyncQueue();
  if (queue.length === 0) {
    console.log('Sync queue is empty.');
    return;
  }
  
  console.log(`Syncing ${queue.length} score(s)...`);
  
  try {
    // Create a separate function for direct API submission to avoid recursion
    const submitScoreDirectly = async (score: Score): Promise<void> => {
      // Log the score we're about to sync
      console.log('Sync: submitting score to API:', score);

      // First, create or get player
      const playerResponse = await apiService.createPlayer({
        name: score.name,
        email: score.email,
        phone: score.phone,
      });

      if (!playerResponse || !playerResponse.id) {
        console.error('Sync: invalid player response for score:', score, playerResponse);
        throw new Error('Invalid player response during sync');
      }

      if (score.time == null || Number.isNaN(Number(score.time))) {
        console.error('Sync: skipping submission for score with invalid time:', score);
        throw new Error('Invalid score time during sync');
      }

      // Then submit the score
      await apiService.submitScore({
        id: score.id,
        name: score.name,
        email: score.email,
        phone: score.phone,
        time: score.time,
      });
    };
    
    const remaining: Score[] = [];
    for (const score of queue) {
      // Skip and drop invalid queued entries (non-positive times)
      if (score.time == null || Number.isNaN(Number(score.time)) || Number(score.time) <= 0) {
        console.warn('Dropping invalid queued score during sync:', score);
        continue;
      }

      try {
        await submitScoreDirectly(score);
      } catch (err) {
        // Keep this score for the next sync attempt
        console.error('Failed to submit queued score, will keep in queue:', score, err);
        remaining.push(score);
      }
    }

    if (remaining.length === 0) {
      console.log('Sync successful. Clearing queue.');
      localStorage.removeItem(SYNC_QUEUE_KEY);
    } else {
      console.log(`Sync partially successful. ${remaining.length} item(s) remain in queue.`);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    }
  } catch (error) {
    console.error('Sync failed. Data remains in queue:', error);
  }
};

export const initSyncManager = () => {
  window.addEventListener('online', syncData);
  // Only attempt initial sync if API is available
  if (navigator.onLine) {
    // Add a delay to avoid immediate sync on app load
    setTimeout(() => {
      syncData().catch(() => {
        console.log('Initial sync skipped - API not available');
      });
    }, 5000);
  }
};
