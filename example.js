const cron = require('node-cron');
const { userCollection } = require('./db'); // Your database connection

// Runs every hour
cron.schedule('0 * * * *', async () => {
  try {
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000);

    // Find users whose premiumToken has expired
    const expiredUsers = await userCollection
      .find({
        subscription: 'premium',
        premiumToken: { $lt: currentTimeInSeconds },
      })
      .toArray();

    // Update all expired users to "regular"
    if (expiredUsers.length > 0) {
      await userCollection.updateMany(
        {
          subscription: 'premium',
          premiumToken: { $lt: currentTimeInSeconds },
        },
        { $set: { subscription: 'regular' } }
      );
      console.log(`${expiredUsers.length} users downgraded to regular.`);
    } else {
      console.log('No expired subscriptions found.');
    }
  } catch (error) {
    console.error('Error downgrading subscriptions:', error);
  }
});
