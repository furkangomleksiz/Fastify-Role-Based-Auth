import PocketBase from 'pocketbase';
import config from '../config/env';

// Create a single PocketBase instance
const pb = new PocketBase(config.pocketbaseUrl);

// Disable auto cancellation to allow multiple requests
pb.autoCancellation(false);

// Authenticate with superuser credentials on initialization
export async function initializePocketBase() {
  try {
    // Use the new _superusers collection for authentication (PocketBase 0.8+)
    await pb.collection('_superusers').authWithPassword(
      config.pocketbaseAdminEmail,
      config.pocketbaseAdminPassword,
      {
        // Auto refresh or reauthenticate if token expires or is expiring in next 30 minutes
        autoRefreshThreshold: 30 * 60
      }
    );
    console.log('✓ PocketBase authenticated as superuser successfully');
  } catch (error: any) {
    console.error('✗ Failed to authenticate with PocketBase:', error);
    throw new Error(`PocketBase authentication failed: ${error?.message || 'Unknown error'}`);
  }
}

export default pb;

