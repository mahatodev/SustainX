#!/usr/bin/env python3
"""
SustainX 2.0 - IoT Smart Recycling Bin & Energy Meter Simulator
Generates cryptographically signed HMAC-SHA256 telemetry packets
for tabletop examination and viva demonstrations without physical sensors.
"""

import sys
import time
import hmac
import hashlib
import json
import argparse
import urllib.request
import urllib.error

DEVICE_ID = "ESP32-BIN-001"
DEFAULT_USER = "usr_deepak_01"
DEFAULT_SECRET = "sustainx-iot-secret-2024"
DEFAULT_SERVER = "http://localhost:3000"

def compute_hmac_signature(device_id: str, user_id: str, waste_type: str, weight: float, energy: float, timestamp: int, secret: str) -> str:
    raw_payload = f"{device_id}:{user_id}:{waste_type}:{weight:.1f}:{energy:.3f}:{timestamp}"
    signature = hmac.new(secret.encode("utf-8"), raw_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return signature

def send_packet(server_url: str, payload: dict) -> dict:
    target = f"{server_url.rstrip('/')}/api/verify/iot"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(target, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return json.loads(body)
        except Exception:
            return {"error": f"HTTP {e.code}", "detail": body}
    except Exception as e:
        return {"error": "ConnectionFailed", "detail": str(e)}

def run_interactive_demo(server_url: str, secret: str):
    print("=" * 70)
    print("  SUSTAINX 2.0 - VIVA JURY IOT HARDWARE SIMULATOR")
    print("=" * 70)
    print("Simulating ESP32-CAM + HX711 Load Cell + PZEM-004T Smart Bin Node\n")

    cases = [
        {
            "name": "1. Valid Smart Bin Drop (340g PET Plastic + 0.15 kWh Solar Feed)",
            "weight": 340.0,
            "waste": "PET_PLASTIC",
            "energy": 0.150,
            "tamper_sig": False,
            "stale_time": 0
        },
        {
            "name": "2. Valid Paper Segregation Drop (850g Paper/Cardboard)",
            "weight": 850.0,
            "waste": "PAPER",
            "energy": 0.050,
            "tamper_sig": False,
            "stale_time": 0
        },
        {
            "name": "3. Anti-Spoof Rejection: Under minimum weight delta (<20g limit)",
            "weight": 12.0,
            "waste": "PET_PLASTIC",
            "energy": 0.010,
            "tamper_sig": False,
            "stale_time": 0
        },
        {
            "name": "4. Anti-Spoof Rejection: Tampered/Forged HMAC Signature",
            "weight": 420.0,
            "waste": "PET_PLASTIC",
            "energy": 0.200,
            "tamper_sig": True,
            "stale_time": 0
        },
        {
            "name": "5. Anti-Spoof Rejection: Timestamp Replay Drift (>300 seconds stale)",
            "weight": 510.0,
            "waste": "METAL",
            "energy": 0.100,
            "tamper_sig": False,
            "stale_time": 720  # 12 minutes old
        }
    ]

    for item in cases:
        print(f"\n---> Executing Test: {item['name']}")
        t = int(time.time()) - item["stale_time"]
        sig = compute_hmac_signature(DEVICE_ID, DEFAULT_USER, item["waste"], item["weight"], item["energy"], t, secret)
        if item["tamper_sig"]:
            sig = "0000000000000000000000000000000000000000000000000000000000000000"

        payload = {
            "deviceId": DEVICE_ID,
            "userId": DEFAULT_USER,
            "wasteType": item["waste"],
            "weightGrams": item["weight"],
            "energyKwh": item["energy"],
            "timestamp": t,
            "hmacSignature": sig
        }

        print(f"Payload: {json.dumps(payload, indent=2)}")
        res = send_packet(server_url, payload)
        print(f"Server Response: {json.dumps(res, indent=2)}")
        time.sleep(1)

def main():
    parser = argparse.ArgumentParser(description="SustainX IoT Hardware Simulator")
    parser.add_argument("--server", default=DEFAULT_SERVER, help="SustainX backend URL")
    parser.add_argument("--secret", default=DEFAULT_SECRET, help="HMAC shared secret")
    parser.add_argument("--demo", action="store_true", help="Run full 5-stage Viva Jury demo suite")
    parser.add_argument("--weight", type=float, default=450.0, help="Weight in grams")
    parser.add_argument("--waste", default="PET_PLASTIC", choices=["PET_PLASTIC", "PAPER", "METAL", "ORGANIC"])
    parser.add_argument("--energy", type=float, default=0.25, help="kWh measurement")
    args = parser.parse_args()

    if args.demo:
        run_interactive_demo(args.server, args.secret)
    else:
        t = int(time.time())
        sig = compute_hmac_signature(DEVICE_ID, DEFAULT_USER, args.waste, args.weight, args.energy, t, args.secret)
        payload = {
            "deviceId": DEVICE_ID,
            "userId": DEFAULT_USER,
            "wasteType": args.waste,
            "weightGrams": args.weight,
            "energyKwh": args.energy,
            "timestamp": t,
            "hmacSignature": sig
        }
        print(f"[Simulator] Sending single packet to {args.server}...")
        res = send_packet(args.server, payload)
        print("Response:", json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
