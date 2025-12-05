# Apple HealthKit Integration Setup Guide

This guide explains how to set up and use the Apple HealthKit integration in RehabFlow.

## Overview

The HealthKit integration enables:
- ✅ Automatic syncing of activity data (steps, distance, calories)
- ✅ Heart rate and HRV monitoring
- ✅ Sleep analysis
- ✅ Workout tracking
- ✅ Body measurements (weight, height, BMI)
- ✅ Recovery score calculation
- ✅ Manual data entry fallback for web users

## Architecture

The integration uses a three-tier architecture:

1. **Service Layer** (`healthDataService.ts`) - Core business logic
2. **Hook Layer** (`useHealthData.ts`) - React integration
3. **Component Layer** (`HealthDataDashboard.tsx`) - UI implementation

## Setup Instructions

### 1. Database Migration

First, apply the database migration to create the necessary tables:

```bash
# Connect to your Supabase project
psql -h <your-supabase-db-host> -U postgres

# Run the migration
\i migrations/add_health_data_table.sql
```

Or use the Supabase dashboard:
1. Go to SQL Editor
2. Copy contents of `migrations/add_health_data_table.sql`
3. Execute the script

This creates:
- `health_data` table - Stores all health metrics
- `health_data_sync_log` table - Tracks synchronization events
- `health_data_preferences` table - User settings
- `daily_activity_summary` view - Aggregated metrics
- Database functions for recovery score and trends

### 2. Install Capacitor (for iOS Native App)

If you plan to build a native iOS app, install Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

Configure capacitor.config.ts:

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.rehabflow.app',
  appName: 'RehabFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### 3. Install HealthKit Plugin

For iOS support, install the Capacitor HealthKit plugin:

```bash
npm install @perfood/capacitor-healthkit
npx cap sync
```

### 4. Configure iOS Permissions

Edit `ios/App/App/Info.plist` and add HealthKit usage descriptions:

```xml
<key>NSHealthShareUsageDescription</key>
<string>RehabFlow needs access to your health data to provide personalized rehabilitation insights and track your recovery progress.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>RehabFlow may write workout data to your Health app to keep your fitness tracking complete.</string>

<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>healthkit</string>
</array>
```

### 5. Enable HealthKit in Xcode

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability" and add "HealthKit"

### 6. Web Fallback (Browser Support)

For web users without iOS:
- The dashboard automatically detects platform availability
- Users can manually enter health data
- All analytics and insights work with manual data
- Future: Web HealthKit API integration when available

## Usage

### In React Components

```typescript
import { HealthDataDashboard } from './components/HealthDataDashboard';

function App() {
  return (
    <div>
      <HealthDataDashboard />
    </div>
  );
}
```

### Using the Hook Directly

```typescript
import { useHealthData } from './hooks/useHealthData';
import { HealthDataType } from './services/healthDataService';

function MyComponent() {
  const {
    state,
    requestAuthorization,
    syncData,
    getDailySummary,
    getRecoveryScore,
    addManualData
  } = useHealthData();

  // Request HealthKit authorization
  const handleConnect = async () => {
    const granted = await requestAuthorization();
    if (granted) {
      console.log('✅ HealthKit authorized');
      await syncData();
    }
  };

  // Get today's activity
  const summary = await getDailySummary();
  console.log('Steps:', summary.steps);

  // Calculate recovery score
  const score = await getRecoveryScore();
  console.log('Recovery:', score);

  // Add manual data (for web users)
  await addManualData(
    HealthDataType.STEPS,
    10000,
    'steps',
    new Date()
  );

  return (
    <div>
      <p>Steps today: {state.dailySummary?.steps}</p>
      <p>Recovery Score: {state.recoveryScore}</p>
      {!state.isAuthorized && (
        <button onClick={handleConnect}>Connect HealthKit</button>
      )}
    </div>
  );
}
```

### Using the Service Directly

```typescript
import { healthDataService, HealthDataType } from './services/healthDataService';

// Check availability
const available = healthDataService.isAvailable();

// Request authorization
const permissions = {
  read: [HealthDataType.STEPS, HealthDataType.HEART_RATE],
  write: []
};
await healthDataService.requestAuthorization(permissions);

// Query data
const endDate = new Date();
const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
const steps = await healthDataService.queryHealthData(
  HealthDataType.STEPS,
  startDate,
  endDate
);

// Sync data
const result = await healthDataService.syncHealthData(userId);
console.log(`Synced ${result.dataPoints} data points`);

// Get daily summary
const summary = await healthDataService.getDailyActivitySummary(userId);

// Calculate recovery score
const score = await healthDataService.calculateRecoveryScore(userId);
```

## Data Types Supported

| Data Type | HealthKit Identifier | Unit |
|-----------|---------------------|------|
| Steps | `HKQuantityTypeIdentifierStepCount` | steps |
| Distance | `HKQuantityTypeIdentifierDistanceWalkingRunning` | meters |
| Active Energy | `HKQuantityTypeIdentifierActiveEnergyBurned` | kcal |
| Heart Rate | `HKQuantityTypeIdentifierHeartRate` | bpm |
| HRV | `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | ms |
| Resting HR | `HKQuantityTypeIdentifierRestingHeartRate` | bpm |
| Sleep Analysis | `HKCategoryTypeIdentifierSleepAnalysis` | minutes |
| Weight | `HKQuantityTypeIdentifierBodyMass` | kg |
| Height | `HKQuantityTypeIdentifierHeight` | cm |
| BMI | `HKQuantityTypeIdentifierBodyMassIndex` | - |

## Recovery Score Algorithm

The recovery score (0-100) is calculated based on:

1. **Sleep Quality (30% weight)**
   - 7-9 hours: +30 points
   - 6-7 hours: +20 points
   - 5-6 hours: +10 points
   - <5 hours: 0 points

2. **Heart Rate (20% weight)**
   - <60 bpm: +20 points
   - 60-70 bpm: +15 points
   - 70-80 bpm: +10 points
   - >80 bpm: 0 points

3. **Activity Level (10% weight)**
   - 7,000-12,000 steps: +10 points (optimal)
   - >12,000 steps: -10 points (overtraining risk)
   - <7,000 steps: 0 points

**Base Score:** 50 points

**Interpretation:**
- 80-100: Excellent recovery, ready for intense training
- 60-79: Good recovery, normal training
- 40-59: Fair recovery, consider light training
- 0-39: Poor recovery, prioritize rest

## Automatic Synchronization

By default, data syncs automatically every 4 hours when authorized. Configure in user preferences:

```typescript
// Adjust sync interval (in minutes)
await supabase
  .from('health_data_preferences')
  .upsert({
    user_id: userId,
    auto_sync_enabled: true,
    sync_interval_minutes: 240, // 4 hours
    enabled_data_types: ['steps', 'heart_rate', 'sleep_analysis']
  });
```

To manually control sync:

```typescript
// Start auto-sync
healthDataService.startAutoSync(userId, 240); // every 240 minutes

// Stop auto-sync
healthDataService.stopAutoSync();

// Manual sync
await healthDataService.syncHealthData(userId);
```

## Privacy & Security

### Data Storage
- All health data is stored in Supabase with encryption at rest
- Row-level security (RLS) ensures users only access their own data
- Providers can view patient data only if assigned

### Data Access
- HealthKit data never leaves the device without explicit sync request
- Users control which data types to share
- Data can be deleted anytime through user preferences

### Compliance
- HIPAA-compliant data handling (when using Supabase HIPAA add-on)
- GDPR-compliant with right to erasure
- Apple HealthKit guidelines fully followed

## Troubleshooting

### "HealthKit not available"
**Solution:** HealthKit only works on physical iOS devices, not simulators. For web/Android users, use manual data entry.

### Authorization Denied
**Solution:**
1. Check Info.plist has usage descriptions
2. User may have denied permission - ask them to enable in iOS Settings > Privacy > Health
3. Ensure HealthKit capability is enabled in Xcode

### Data Not Syncing
**Solution:**
1. Check authorization status: `healthDataService.checkAuthorization()`
2. Verify network connection
3. Check Supabase logs for errors
4. Ensure sync interval hasn't been disabled

### Empty Data
**Solution:**
1. User may not have health data in Health app
2. Check date range is correct
3. Verify data types are authorized for reading

## Roadmap

### Planned Features
- [ ] Google Fit integration (Android)
- [ ] Fitbit API integration
- [ ] Apple Watch complications
- [ ] Web HealthKit API support
- [ ] Real-time sync via background app refresh
- [ ] Workout type classification
- [ ] Nutrition data integration
- [ ] Medication tracking
- [ ] Mindfulness/meditation data

### Future Enhancements
- [ ] AI-powered recovery recommendations
- [ ] Predictive injury risk based on activity patterns
- [ ] Integration with medical devices (blood pressure monitors, glucometers)
- [ ] Sleep stage analysis with recommendations
- [ ] Heart rate variability trends and insights
- [ ] Personalized optimal activity zones

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Capacitor HealthKit plugin docs: https://github.com/perfood/capacitor-healthkit
3. Open an issue on GitHub
4. Contact support@rehabflow.com

## References

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [@perfood/capacitor-healthkit Plugin](https://github.com/perfood/capacitor-healthkit)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
