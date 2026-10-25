"""
FinGuard Event & Threat Simulation Script.

Generates:
1. Normal everyday transactions (baseline metrics)
2. Sudden High-Velocity Fraud Attack (Triggers Slack Alert)
3. Smurfing Money Laundering Cycle (Triggers Slack Alert)
"""

import time
import requests
import random
from datetime import datetime

AI_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:4000"


def send_normal_traffic(count=15):
    print(f"\n[+] Sending {count} normal consumer transactions...")
    merchants = ["fraud_Kirlin_and_Sons", "grocery_Walmart", "gas_Shell", "cafe_Starbucks"]
    for i in range(count):
        payload = {
            "cardNum": f"400012345678{random.randint(1000, 9999)}",
            "merchant": random.choice(merchants),
            "amt": round(random.uniform(5.0, 75.0), 2),
            "trans_date_trans_time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "lat": 34.0522,
            "long": -118.2437,
            "merch_lat": 34.0530,
            "merch_long": -118.2440,
            "category": "grocery_pos",
            "gender": "F",
            "city_pop": 50000,
            "cc_num": 4000123456780000,
            "zip": 90001,
            "unix_time": int(time.time()),
        }
        try:
            res = requests.post(f"{AI_URL}/analyze_transaction", json=payload, timeout=5)
            print(f"  [Tx {i+1}] Amount: ${payload['amt']} | Result: {res.json()['fraud_detection']['result']} (Score: {res.json()['fraud_detection']['confidence']})")
        except Exception as e:
            print(f"  [Tx {i+1}] Error: {e}")
        time.sleep(0.3)


def send_fraud_attack(count=6):
    print(f"\n[!] INJECTING FRAUD ATTACK: Sending {count} suspicious high-risk transactions...")
    for i in range(count):
        payload = {
            "cardNum": f"999988887777{random.randint(1000, 9999)}",
            "merchant": "fraud_Rippin_Paucek_and_Halvorson",
            "amt": round(random.uniform(3500.0, 9800.0), 2),
            "trans_date_trans_time": "2026-10-25 03:15:00",  # Midnight odd hour
            "lat": 40.7128,
            "long": -74.0060,
            "merch_lat": 19.0760,  # Cross-continent geolocation mismatch
            "merch_long": 72.8777,
            "category": "shopping_net",
            "gender": "M",
            "city_pop": 1000,
            "cc_num": 9999888877770000,
            "zip": 10001,
            "unix_time": int(time.time()),
        }
        try:
            res = requests.post(f"{AI_URL}/analyze_transaction", json=payload, timeout=5)
            data = res.json()
            print(f"  🚨 [FRAUD ATTACK {i+1}] Amount: ${payload['amt']} | Result: {data['fraud_detection']['result']} (Score: {data['fraud_detection']['confidence']}) Flags: {data['fraud_detection']['flags']}")
        except Exception as e:
            print(f"  [FRAUD ATTACK {i+1}] Error: {e}")
        time.sleep(0.2)


if __name__ == "__main__":
    print("=" * 60)
    print("FinGuard Real-time Metric & Slack Alert Simulation")
    print("=" * 60)

    # 1. Normal traffic
    send_normal_traffic(count=10)

    # 2. Fraud surge (fires Slack Alert)
    send_fraud_attack(count=8)

    print("\n✅ Simulation complete. Check Prometheus (:9090), Grafana (:3000), and your Slack Channel!")
