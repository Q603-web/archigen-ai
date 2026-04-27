#!/usr/bin/env node
// Post a tweet to @archigenai using Twitter API v2
// Usage: node scripts/tweet.js "Your tweet text here"

const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

const text = process.argv[2];
if (!text) {
  console.error('Usage: node scripts/tweet.js "Your tweet text"');
  process.exit(1);
}

client.v2.tweet(text)
  .then(result => {
    console.log('Tweet posted!');
    console.log('ID:', result.data?.id);
    console.log('Text:', result.data?.text);
  })
  .catch(err => {
    console.error('Failed:', err.message || err);
    if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
    process.exit(1);
  });
