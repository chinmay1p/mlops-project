const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { transactionsProcessed, transactionAmount } = require('../metrics');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const ADMIN_EMAIL = 'admin@finguard.ai';
const ADMIN_PASSWORD = 'admin123';

const SLACK_HOOK = process.env.SLACK_WEBHOOK_URL || (
  'https://hooks.slack.com/services/' + 'T0CBU31P7HB/' + 'B0CBJC02REK/' + 'PTnVDkFBZPh5DsP2yupWtgKK'
);

async function notifySlack(title, text, color = '#ef4444') {
  try {
    await axios.post(SLACK_HOOK, {
      attachments: [{
        color,
        title,
        text,
        footer: 'FinGuard Security Operations Center (SOC)',
        ts: Math.floor(Date.now() / 1000)
      }]
    }, { timeout: 3500 });
  } catch (err) {
    console.warn('Slack dispatch warning:', err.message);
  }
}

// ── 1. Seed Initial Dashboard & Admin Data ───────────────────
router.post('/seed-all', async (_req, res) => {
  try {
    // 1. Ensure Admin exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: 'FinGuard Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        gender: 'Other',
        mobileNumber: '9999999999',
      });
    }

    // 2. Insert realistic historical transactions if database has fewer than 10
    const count = await Transaction.countDocuments();
    if (count < 10) {
      const sampleTxns = [
        {
          cardNum: '4111222233334444',
          merchant: 'Target Store #0421',
          category: 'shopping_pos',
          amount: 64.50,
          transDateTime: new Date(Date.now() - 1000 * 60 * 30),
          fraudScore: 0.08,
          fraudFlags: [],
          isSmurfing: false,
          analystLabel: 'unreviewed',
          userId: admin._id,
        },
        {
          cardNum: '5200112233445566',
          merchant: 'Whole Foods Market',
          category: 'grocery_pos',
          amount: 112.30,
          transDateTime: new Date(Date.now() - 1000 * 60 * 25),
          fraudScore: 0.04,
          fraudFlags: [],
          isSmurfing: false,
          analystLabel: 'unreviewed',
          userId: admin._id,
        },
        {
          cardNum: '4000123456789010',
          merchant: 'Starbucks Coffee',
          category: 'food_dining',
          amount: 14.75,
          transDateTime: new Date(Date.now() - 1000 * 60 * 20),
          fraudScore: 0.02,
          fraudFlags: [],
          isSmurfing: false,
          analystLabel: 'unreviewed',
          userId: admin._id,
        },
        {
          cardNum: '4916123456789012',
          merchant: 'Best Buy Electronics',
          category: 'shopping_pos',
          amount: 780.00,
          transDateTime: new Date(Date.now() - 1000 * 60 * 15),
          fraudScore: 0.42,
          fraudFlags: ['elevated_amount'],
          isSmurfing: false,
          analystLabel: 'unreviewed',
          userId: admin._id,
        },
        {
          cardNum: '378282246310005',
          merchant: 'Shady Crypto Exchange',
          category: 'misc_net',
          amount: 5400.00,
          transDateTime: new Date(Date.now() - 1000 * 60 * 10),
          fraudScore: 0.94,
          fraudFlags: ['geolocation_mismatch', 'high_amount', 'odd_hour'],
          isSmurfing: true,
          smurfingPattern: 'fan_in',
          analystLabel: 'true_positive',
          userId: admin._id,
        },
        {
          cardNum: '4532758912345678',
          merchant: 'Apple Store Online',
          category: 'shopping_net',
          amount: 1299.00,
          transDateTime: new Date(Date.now() - 1000 * 60 * 5),
          fraudScore: 0.72,
          fraudFlags: ['high_risk_score', 'high_amount'],
          isSmurfing: false,
          analystLabel: 'unreviewed',
          userId: admin._id,
        },
      ];

      await Transaction.insertMany(sampleTxns);
    }

    const currentTotal = await Transaction.countDocuments();
    res.json({
      success: true,
      message: `Database ready. ${currentTotal} transactions available.`,
      adminAccount: ADMIN_EMAIL,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. Simulate Normal Traffic ──────────────────────────────
router.post('/simulate-normal', async (_req, res) => {
  try {
    const merchants = ['Amazon.com', 'Uber Technologies', 'Netflix Subscription', 'Trader Joes', 'Shell Gas Station'];
    const results = [];

    for (let i = 0; i < 4; i++) {
      const amt = Number((Math.random() * 80 + 10).toFixed(2));
      const merchant = merchants[i % merchants.length];
      const cardNum = `400012345678${Math.floor(1000 + Math.random() * 9000)}`;

      // Evaluate with AI service
      let aiResult = null;
      try {
        const { data } = await axios.post(`${AI_SERVICE_URL}/analyze_transaction`, {
          cardNum,
          merchant,
          amt,
          trans_date_trans_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
          lat: 37.7749,
          long: -122.4194,
          merch_lat: 37.7750,
          merch_long: -122.4190,
          category: 'shopping_pos',
          gender: 'M',
          city_pop: 800000,
          cc_num: cardNum,
          zip: 94103,
          unix_time: Math.floor(Date.now() / 1000),
        }, { timeout: 4000 });
        aiResult = data;
      } catch (e) {
        console.warn('AI service call skipped:', e.message);
      }

      const txn = await Transaction.create({
        cardNum,
        merchant,
        category: 'shopping_pos',
        amount: amt,
        transDateTime: new Date(),
        fraudScore: aiResult?.fraud_detection?.confidence ?? 0.05,
        fraudFlags: aiResult?.fraud_detection?.flags ?? [],
        isSmurfing: false,
      });

      transactionsProcessed.inc({ status: 'APPROVED', is_smurfing: 'false' });
      transactionAmount.observe(amt);

      results.push({ cardNum, merchant, amount: amt, score: txn.fraudScore });
    }

    res.json({ success: true, count: results.length, transactions: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. Simulate Fraud Attack Spike (Triggers Slack) ──────────
router.post('/simulate-fraud', async (_req, res) => {
  try {
    const fraudMerchants = ['fraud_Rippin_Paucek', 'Offshore_Bettor_LLC', 'Crypto_Anonymizer_IO'];
    const results = [];

    for (let i = 0; i < 4; i++) {
      const amt = Number((Math.random() * 4000 + 5500).toFixed(2));
      const merchant = fraudMerchants[i % fraudMerchants.length];
      const cardNum = `999988887777${Math.floor(1000 + Math.random() * 9000)}`;

      let aiResult = null;
      try {
        const { data } = await axios.post(`${AI_SERVICE_URL}/analyze_transaction`, {
          cardNum,
          merchant,
          amt,
          trans_date_trans_time: '2026-10-25 03:22:15',
          lat: 40.7128,
          long: -74.0060,
          merch_lat: 19.0760, // cross-continental mismatch
          merch_long: 72.8777,
          category: 'shopping_net',
          gender: 'F',
          city_pop: 1000,
          cc_num: cardNum,
          zip: 10001,
          unix_time: Math.floor(Date.now() / 1000),
        }, { timeout: 4000 });
        aiResult = data;
      } catch (e) {
        console.warn('AI service call skipped:', e.message);
      }

      const txn = await Transaction.create({
        cardNum,
        merchant,
        category: 'misc_net',
        amount: amt,
        transDateTime: new Date(),
        fraudScore: aiResult?.fraud_detection?.confidence ?? 0.94,
        fraudFlags: ['high_risk_score', 'geolocation_mismatch', 'high_amount', 'odd_hour'],
        isSmurfing: false,
      });

      transactionsProcessed.inc({ status: 'BLOCKED', is_smurfing: 'false' });
      transactionAmount.observe(amt);

      results.push({ cardNum, merchant, amount: amt, score: txn.fraudScore });
    }

    await notifySlack(
      '🚨 CRITICAL FRAUD ATTACK SPIKE DETECTED',
      `*Severity:* \`CRITICAL\`\n*Details:* 4 suspicious high-value midnight transactions ($5,500 - $9,500) with geolocation mismatches blocked by AI model.\n*Target Merchants:* ${fraudMerchants.join(', ')}`,
      '#ef4444'
    );

    res.json({
      success: true,
      message: '🚨 Fraud attack injected! Prometheus metrics spiked and Slack Alert triggered.',
      count: results.length,
      transactions: results,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. Simulate Smurfing Money Laundering (Triggers Slack) ────
router.post('/simulate-smurfing', async (_req, res) => {
  try {
    const ringCards = ['1111000011110000', '2222000022220000', '3333000033330000'];
    const results = [];

    for (let i = 0; i < ringCards.length; i++) {
      const amt = 4950.00; // Just under standard $5,000 structuring limit
      const cardNum = ringCards[i];

      const txn = await Transaction.create({
        cardNum,
        merchant: 'Layered Crypto Gateway',
        category: 'money_transfer',
        amount: amt,
        transDateTime: new Date(),
        fraudScore: 0.89,
        fraudFlags: ['structured_deposit', 'known_layering_ring'],
        isSmurfing: true,
        smurfingPattern: 'circular_cycle',
      });

      transactionsProcessed.inc({ status: 'FLAGGED', is_smurfing: 'true' });
      transactionAmount.observe(amt);

      results.push({ cardNum, amount: amt, pattern: 'circular_cycle' });
    }

    // Call AI service deep smurfing check to increment smurfing gauge
    try {
      await axios.post(`${AI_SERVICE_URL}/detect_smurfing`, { account: ringCards[0] }, { timeout: 3000 });
    } catch (_) {}

    await notifySlack(
      '🕸️ MONEY LAUNDERING SMURFING RING DETECTED',
      `*Severity:* \`CRITICAL\`\n*Details:* Multiple structured deposits just under $5,000 regulatory threshold detected across ${ringCards.length} layered accounts.\n*Pattern:* Circular Layering Cycle`,
      '#f59e0b'
    );

    res.json({
      success: true,
      message: '🕸️ Smurfing laundering ring injected! Alertmanager notified.',
      count: results.length,
      ringTransactions: results,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
