# New Component Research: Node-cron for Scheduled Tasks

## Component Overview

**Package:** node-cron  
**NPM Link:** https://www.npmjs.com/package/node-cron  
**Current Version:** 3.0.3  
**Purpose:** Schedule and execute automated tasks using cron syntax

## What is Node-cron?

Node-cron is a task scheduler in pure JavaScript for Node.js based on GNU crontab. It allows you to schedule tasks (functions or commands) to run periodically at fixed times, dates, or intervals using cron syntax.

## Why This Component for FitTrack API?

### 1. **Daily Workout Reminders**
Send automated reminders to users about their scheduled workouts for the day.

### 2. **Automatic Workout Generation**
When users enroll in workout plans, automatically create their scheduled workouts for the upcoming week/month.

### 3. **Streak Calculation**
Update workout streaks daily at midnight to track user consistency.

### 4. **Data Cleanup**
Archive or delete old workout data periodically to keep the database clean.

### 5. **Weekly/Monthly Reports**
Generate and send progress reports to users automatically.

## Cron Syntax Quick Reference
```
# ┌────────────── second (optional, 0-59)
# │ ┌──────────── minute (0-59)
# │ │ ┌────────── hour (0-23)
# │ │ │ ┌──────── day of month (1-31)
# │ │ │ │ ┌────── month (1-12)
# │ │ │ │ │ ┌──── day of week (0-7, 0 and 7 are Sunday)
# │ │ │ │ │ │
# * * * * * *
```

**Common Examples:**
- `0 8 * * *` - Every day at 8:00 AM
- `0 0 * * 0` - Every Sunday at midnight
- `*/15 * * * *` - Every 15 minutes
- `0 0 1 * *` - First day of every month at midnight
- `0 9 * * 1-5` - Weekdays at 9:00 AM

## Implementation Plan

### Phase 1: Basic Setup (Milestone 1)
- Install node-cron package
- Create cron service module
- Implement one simple job (daily reminder)
- Test the job execution
- Document in this file

### Phase 2: Core Jobs (Milestone 2)
- Daily workout reminder job (8 AM daily)
- Weekly workout generation job (Sunday midnight)
- Daily streak calculation job (midnight)
- Add logging for job execution

### Phase 3: Advanced Features (Milestone 3)
- Manual trigger endpoints for testing
- Job status monitoring
- Error handling and retry logic
- Configuration via environment variables

## Installation
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

## Basic Implementation Example
```typescript
import cron from 'node-cron';

// Every day at 8 AM - send workout reminders
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily workout reminder job...');
  
  try {
    const today = new Date();
    const workouts = await getWorkoutsScheduledForToday(today);
    
    for (const workout of workouts) {
      await sendReminderNotification(workout.userId, workout);
    }
    
    console.log(`Sent ${workouts.length} workout reminders`);
  } catch (error) {
    console.error('Error in workout reminder job:', error);
  }
});
```

## Proposed File Structure
```
src/
├── jobs/
│   ├── cronService.ts          # Main cron service setup
│   ├── workoutReminderJob.ts   # Daily reminder job
│   ├── workoutGenerationJob.ts # Weekly generation job
│   ├── streakCalculationJob.ts # Daily streak job
│   └── cleanupJob.ts            # Periodic cleanup job
```

## Integration with FitTrack API

### 1. Cron Service Module

**File: `src/jobs/cronService.ts`**
```typescript
import cron from 'node-cron';
import { workoutReminderJob } from './workoutReminderJob';
import { streakCalculationJob } from './streakCalculationJob';
import { workoutGenerationJob } from './workoutGenerationJob';

export class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize all cron jobs
   */
  start(): void {
    console.log('🕐 Initializing cron jobs...');

    // Daily workout reminders - 8 AM
    const reminderJob = cron.schedule('0 8 * * *', workoutReminderJob, {
      scheduled: true,
      timezone: 'America/Winnipeg',
    });
    this.jobs.set('workoutReminder', reminderJob);

    // Daily streak calculation - Midnight
    const streakJob = cron.schedule('0 0 * * *', streakCalculationJob, {
      scheduled: true,
      timezone: 'America/Winnipeg',
    });
    this.jobs.set('streakCalculation', streakJob);

    // Weekly workout generation - Sunday midnight
    const generationJob = cron.schedule('0 0 * * 0', workoutGenerationJob, {
      scheduled: true,
      timezone: 'America/Winnipeg',
    });
    this.jobs.set('workoutGeneration', generationJob);

    console.log('✅ Cron jobs initialized successfully');
    console.log(`   - Workout reminders: Daily at 8:00 AM`);
    console.log(`   - Streak calculation: Daily at midnight`);
    console.log(`   - Workout generation: Sundays at midnight`);
  }

  /**
   * Stop all cron jobs
   */
  stop(): void {
    console.log('Stopping all cron jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`   - Stopped: ${name}`);
    });
  }

  /**
   * Get status of all jobs
   */
  getJobStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];
    this.jobs.forEach((job, name) => {
      status.push({ name, running: job.getStatus() === 'scheduled' });
    });
    return status;
  }
}
```

### 2. Workout Reminder Job

**File: `src/jobs/workoutReminderJob.ts`**
```typescript
import { WorkoutRepository } from '../api/v1/repositories/workoutRepository';

const workoutRepository = new WorkoutRepository();

export const workoutReminderJob = async (): Promise<void> => {
  const startTime = Date.now();
  console.log('📧 Running workout reminder job...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all scheduled workouts for today
    // This would need a method to get all workouts across all users
    // For now, this is pseudocode:
    // const workouts = await workoutRepository.findScheduledForDate(today, tomorrow);
    
    // Send reminders (would integrate with email/notification service)
    // for (const workout of workouts) {
    //   await sendReminder(workout);
    // }

    const duration = Date.now() - startTime;
    console.log(`✅ Workout reminder job completed in ${duration}ms`);
  } catch (error) {
    console.error('❌ Error in workout reminder job:', error);
  }
};
```

### 3. Integration in Server

**Update `src/server.ts`:**
```typescript
import app from './app';
import { CronService } from './jobs/cronService';

const PORT: string | number = process.env.PORT || 3000;
const cronService = new CronService();

app.listen(PORT, () => {
  console.log(`🚀 FitTrack API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start cron jobs in production
  if (process.env.NODE_ENV === 'production') {
    cronService.start();
  } else {
    console.log('⏸️  Cron jobs disabled in development mode');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  cronService.stop();
  process.exit(0);
});
```

## Benefits for FitTrack API

1. **Automated User Engagement**: Reminders keep users engaged with their fitness goals
2. **Reduced Manual Work**: Automatic workout generation saves time
3. **Data Insights**: Regular streak calculations provide valuable metrics
4. **System Health**: Automated cleanup keeps the system running smoothly
5. **Scalability**: Jobs run in background without affecting API performance

## Potential Challenges & Solutions

### Challenge 1: Multiple Server Instances
**Problem:** If running multiple API instances, jobs might run multiple times.  
**Solution:** Use distributed locking (Redis) or run cron jobs on a dedicated worker instance.

### Challenge 2: Long-Running Jobs
**Problem:** Jobs that take too long might overlap with next execution.  
**Solution:** Implement job locking and skip if previous instance still running.

### Challenge 3: Error Handling
**Problem:** Failed jobs might go unnoticed.  
**Solution:** Implement comprehensive logging and monitoring/alerting.

### Challenge 4: Testing
**Problem:** Difficult to test time-based functionality.  
**Solution:** Create manual trigger endpoints for testing, mock time in tests.

## Testing Strategy

1. **Manual Triggers**: Create API endpoints to manually trigger jobs for testing
2. **Mock Time**: Use Jest's timer mocks for unit tests
3. **Integration Tests**: Test actual job execution in test environment
4. **Logging**: Comprehensive logs to verify job execution

## Alternative Options Considered

### 1. **Bull Queue** (with Redis)
- **Pros:** More robust, distributed, better for production
- **Cons:** Requires Redis, more complex setup
- **Decision:** Too heavy for current needs, node-cron is simpler

### 2. **Agenda** (with MongoDB)
- **Pros:** Persistent job scheduling, dashboard
- **Cons:** Requires MongoDB (we use Firestore), additional dependency
- **Decision:** Adds unnecessary complexity

### 3. **Native setTimeout/setInterval**
- **Pros:** Built-in, no dependencies
- **Cons:** Not persistent, harder to manage, no cron syntax
- **Decision:** Too basic, lacks features

## Conclusion

**Node-cron is the best choice for FitTrack API because:**
-  Simple to implement and understand
-  No additional infrastructure required
-  Familiar cron syntax
-  Lightweight and performant
-  Perfect for MVP and can scale
-  Easy to test and debug

**Status:** Ready for implementation in Milestone 2

**Next Steps:**
1. Install node-cron package
2. Create basic cron service structure
3. Implement first job (workout reminder)
4. Test in development environment
5. Add manual trigger endpoints for testing