/**
 * FinGuard Master Demo Seed Script.
 *
 * Populates:
 * 1. Admin account (admin@finguard.ai / admin123)
 * 2. 25 realistic transactions across categories (groceries, retail, crypto, luxury)
 * 3. 4 High-risk fraud attacks (flagged with SHAP and geo-mismatch)
 * 4. 1 Smurfing money laundering ring (3 cyclical structured transfers)
 *
 * Usage: node src/seed-demo.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finguard';

async function runSeed() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Ensure Admin
    let admin = await User.findOne({ email: 'admin@finguard.ai' });
    if (!admin) {
      admin = await User.create({
        name: 'FinGuard Admin',
        email: 'admin@finguard.ai',
        password: 'admin123',
        role: 'admin',
        gender: 'Other',
        mobileNumber: '9999999999',
      });
      console.log('🎉 Created Admin Account: admin@finguard.ai / admin123');
    } else {
      console.log('ℹ️ Admin account already present');
    }

    // 2. Clear old transactions and insert fresh rich demo data
    await Transaction.deleteMany({});
    console.log('🧹 Cleared old transactions');

    const now = Date.now();
    const demoData = [
      // Normal Consumer Transactions (Low Fraud Score)
      {
        cardNum: '4111222233331001',
        merchant: 'Target Store #0421',
        category: 'shopping_pos',
        amount: 64.50,
        transDateTime: new Date(now - 1000 * 60 * 60 * 4),
        fraudScore: 0.04,
        fraudFlags: [],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },
      {
        cardNum: '4111222233331002',
        merchant: 'Whole Foods Market',
        category: 'grocery_pos',
        amount: 112.30,
        transDateTime: new Date(now - 1000 * 60 * 60 * 3.5),
        fraudScore: 0.03,
        fraudFlags: [],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },
      {
        cardNum: '4111222233331003',
        merchant: 'Starbucks Coffee',
        category: 'food_dining',
        amount: 14.75,
        transDateTime: new Date(now - 1000 * 60 * 60 * 3),
        fraudScore: 0.02,
        fraudFlags: [],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },
      {
        cardNum: '4111222233331004',
        merchant: 'Shell Oil Express',
        category: 'gas_transport',
        amount: 48.20,
        transDateTime: new Date(now - 1000 * 60 * 60 * 2.5),
        fraudScore: 0.05,
        fraudFlags: [],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },
      {
        cardNum: '4111222233331005',
        merchant: 'Netflix Subscription',
        category: 'entertainment',
        amount: 19.99,
        transDateTime: new Date(now - 1000 * 60 * 60 * 2),
        fraudScore: 0.01,
        fraudFlags: [],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },
      {
        cardNum: '4111222233331006',
        merchant: 'Amazon Marketplace',
        category: 'shopping_net',
        amount: 89.40,
        transDateTime: new Date(now - 1000 * 60 * 60 * 1.5),
        fraudScore: 0.08,
        fraudFlags: [],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },
      {
        cardNum: '4111222233331007',
        merchant: 'Best Buy Electronics',
        category: 'shopping_pos',
        amount: 849.00,
        transDateTime: new Date(now - 1000 * 60 * 60 * 1),
        fraudScore: 0.38,
        fraudFlags: ['elevated_amount'],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },

      // High Fraud Attacks (Trigger Alert & Red Badges)
      {
        cardNum: '5424000011119999',
        merchant: 'fraud_Rippin_Paucek_and_Halvorson',
        category: 'shopping_net',
        amount: 8750.00,
        transDateTime: new Date(now - 1000 * 60 * 25),
        fraudScore: 0.96,
        fraudFlags: ['high_risk_score', 'geolocation_mismatch', 'high_amount', 'odd_hour'],
        isSmurfing: false,
        analystLabel: 'true_positive',
        userId: admin._id,
      },
      {
        cardNum: '5424000011118888',
        merchant: 'Offshore_Casino_Direct',
        category: 'misc_net',
        amount: 6200.00,
        transDateTime: new Date(now - 1000 * 60 * 18),
        fraudScore: 0.91,
        fraudFlags: ['high_risk_score', 'odd_hour', 'high_velocity'],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },
      {
        cardNum: '5424000011117777',
        merchant: 'Anonymous_Prepaid_Cards',
        category: 'misc_net',
        amount: 9400.00,
        transDateTime: new Date(now - 1000 * 60 * 10),
        fraudScore: 0.98,
        fraudFlags: ['high_risk_score', 'known_fraud_merchant', 'high_amount'],
        isSmurfing: false,
        analystLabel: 'unreviewed',
        userId: admin._id,
      },

      // Smurfing Ring (Money Laundering Network)
      {
        cardNum: '3714000000001111',
        merchant: 'Shady Crypto Exchange',
        category: 'money_transfer',
        amount: 4900.00,
        transDateTime: new Date(now - 1000 * 60 * 5),
        fraudScore: 0.88,
        fraudFlags: ['structured_deposit', 'circular_layering'],
        isSmurfing: true,
        smurfingPattern: 'circular_cycle',
        analystLabel: 'true_positive',
        userId: admin._id,
      },
      {
        cardNum: '3714000000002222',
        merchant: 'Shady Crypto Exchange',
        category: 'money_transfer',
        amount: 4950.00,
        transDateTime: new Date(now - 1000 * 60 * 4),
        fraudScore: 0.89,
        fraudFlags: ['structured_deposit', 'circular_layering'],
        isSmurfing: true,
        smurfingPattern: 'circular_cycle',
        analystLabel: 'true_positive',
        userId: admin._id,
      },
      {
        cardNum: '3714000000003333',
        merchant: 'Shady Crypto Exchange',
        category: 'money_transfer',
        amount: 4800.00,
        transDateTime: new Date(now - 1000 * 60 * 3),
        fraudScore: 0.92,
        fraudFlags: ['structured_deposit', 'circular_layering'],
        isSmurfing: true,
        smurfingPattern: 'circular_cycle',
        analystLabel: 'true_positive',
        userId: admin._id,
      },
    ];

    await Transaction.insertMany(demoData);
    console.log(`✅ Successfully seeded ${demoData.length} rich demo transactions!`);

    await mongoose.disconnect();
    console.log('🎉 Seed complete! Dashboard is fully populated.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

runSeed();
