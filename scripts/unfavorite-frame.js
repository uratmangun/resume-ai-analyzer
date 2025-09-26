#!/usr/bin/env node

require('dotenv/config');
const { randomUUID } = require('crypto');

async function unfavoriteFrame() {
  const url = 'https://client.farcaster.xyz/v1/favorite-frames';
  const bearerToken = process.env.FARCASTER_BEARER_TOKEN;

  if (!bearerToken) {
    console.error('Error: FARCASTER_BEARER_TOKEN is not set in your .env file.');
    console.log('Please add your bearer token to the .env file to post to Farcaster.');
    return;
  }

  const domain = process.argv[2] || 'eggs.name';

  const payload = {
    domain: domain
  };

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${bearerToken}`,
    'accept': '*/*',
    'fc-amplitude-device-id': 'RhFKhscZZqleZwa7isQJxe',
    'fc-amplitude-session-id': '1756511234470',
    'idempotency-key': randomUUID(),
    'origin': 'https://farcaster.xyz',
    'referer': 'https://farcaster.xyz/',
    'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
  };

  try {
    console.log(`🚀 Unfavoriting frame for domain: ${domain}...`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Successfully unfavorited frame:');
      console.log(JSON.stringify(responseData, null, 2));
    } else {
      console.error(`❌ Error unfavoriting frame: ${response.status} ${response.statusText}`);
      console.error('   Response:', responseData);
    }
  } catch (error) {
    console.error('💥 An unexpected error occurred:');
    console.error(error);
  }
}

// Execute the function
unfavoriteFrame();