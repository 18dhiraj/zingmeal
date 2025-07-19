import { doc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface VisitSession {
  mealId: string;
  visitStartTime: number;
  hasBeenTracked: boolean;
}

class PopularityService {
  private visitSessions: Map<string, VisitSession> = new Map();
  private readonly MIN_VISIT_DURATION = 3000; // 3 seconds minimum visit duration
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes session timeout

  /**
   * Start tracking a meal visit
   * @param mealId - The ID of the meal being visited
   * @param mealName - The name of the meal (for analytics)
   */
  public startMealVisit(mealId: string, mealName?: string): void {
    console.log(`🔍 Started tracking visit for meal: ${mealName || mealId}`);
    
    const now = Date.now();
    
    // Clean up old sessions
    this.cleanupOldSessions(now);
    
    // Check if this meal is already being tracked
    const existingSession = this.visitSessions.get(mealId);
    if (existingSession && !existingSession.hasBeenTracked) {
      console.log(`📊 Already tracking visit for meal: ${mealName || mealId}`);
      return;
    }

    // Start new visit session
    this.visitSessions.set(mealId, {
      mealId,
      visitStartTime: now,
      hasBeenTracked: false,
    });

    // Set timer to update popularity after minimum visit duration
    setTimeout(() => {
      this.processMealVisit(mealId, mealName);
    }, this.MIN_VISIT_DURATION);
  }

  /**
   * Process the meal visit and update database if criteria are met
   * @param mealId - The ID of the meal
   * @param mealName - The name of the meal (for logging)
   */
  private async processMealVisit(mealId: string, mealName?: string): Promise<void> {
    const session = this.visitSessions.get(mealId);
    
    if (!session || session.hasBeenTracked) {
      return;
    }

    const visitDuration = Date.now() - session.visitStartTime;
    
    if (visitDuration >= this.MIN_VISIT_DURATION) {
      console.log(`✅ Valid visit detected for ${mealName || mealId} (${visitDuration}ms)`);
      
      // Mark as tracked to prevent double counting
      session.hasBeenTracked = true;
      
      try {
        await this.updateMealPopularity(mealId);
        console.log(`🎯 Successfully updated popularity for meal: ${mealName || mealId}`);
      } catch (error) {
        console.error(`❌ Failed to update popularity for meal ${mealId}:`, error);
      }
    } else {
      console.log(`⚡ Visit too short for ${mealName || mealId} (${visitDuration}ms) - not counting`);
    }
  }

  /**
   * Update meal popularity in Firestore
   * @param mealId - The ID of the meal to update
   */
  private async updateMealPopularity(mealId: string): Promise<void> {
    const mealRef = doc(db, 'meals', mealId);
    
    try {
      // Check if meal exists first
      const mealDoc = await getDoc(mealRef);
      if (!mealDoc.exists()) {
        console.warn(`⚠️ Meal ${mealId} does not exist in database`);
        return;
      }

      // Update popularity fields
      await updateDoc(mealRef, {
        popularity: increment(1),
        totalViews: increment(1),
        lastVisitedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`📈 Popularity updated for meal ${mealId}`);
    } catch (error) {
      console.error(`💥 Error updating meal popularity:`, error);
      throw error;
    }
  }

  /**
   * Clean up old visit sessions to prevent memory leaks
   * @param currentTime - Current timestamp
   */
  private cleanupOldSessions(currentTime: number): void {
    const sessionsToRemove: string[] = [];
    
    this.visitSessions.forEach((session, mealId) => {
      if (currentTime - session.visitStartTime > this.SESSION_TIMEOUT) {
        sessionsToRemove.push(mealId);
      }
    });

    sessionsToRemove.forEach(mealId => {
      this.visitSessions.delete(mealId);
      console.log(`🧹 Cleaned up old session for meal: ${mealId}`);
    });
  }

  /**
   * Stop tracking a meal visit (called when user leaves the page)
   * @param mealId - The ID of the meal
   */
  public stopMealVisit(mealId: string): void {
    const session = this.visitSessions.get(mealId);
    if (session && !session.hasBeenTracked) {
      console.log(`🛑 Stopping visit tracking for meal: ${mealId} (visit was too short)`);
      this.visitSessions.delete(mealId);
    }
  }

  /**
   * Get popular meals based on popularity score
   * @param limit - Number of popular meals to return
   */
  public async getPopularMeals(limit: number = 10): Promise<any[]> {
    try {
      // This would be implemented when we have enough data
      // For now, we'll return an empty array and let the existing system handle it
      console.log(`📊 Getting ${limit} most popular meals`);
      return [];
    } catch (error) {
      console.error('Error fetching popular meals:', error);
      return [];
    }
  }
}

// Export singleton instance
export const popularityService = new PopularityService();

// Export the class for testing if needed
export { PopularityService };
