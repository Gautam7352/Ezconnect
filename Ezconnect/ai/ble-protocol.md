> Added 2026-08-20 — initial definition

# BLE & NFC Exchange Protocol

This document defines the complete BLE and NFC Host Card Emulation (HCE) protocols for Ezconnect-to-Ezconnect contact exchange.

## 1. BLE Protocol Specification

We use `munim-bluetooth` to handle simultaneous BLE Central (scanning/connecting) and Peripheral (advertising/hosting) roles.

### 1.1 Fixed UUIDs

Do **NOT** change these UUIDs. They are the fixed schema for Ezconnect devices to discover and talk to each other.

- **Service UUID**: `EZC00001-EZC0-1000-8000-00805F9B34FB`
- **Profile Read Characteristic UUID**: `EZC00002-EZC0-1000-8000-00805F9B34FB`
  - **Properties**: `READ`, `NOTIFY`
  - **Contains**: The advertising device's profile JSON payload.
- **Exchange Confirm Characteristic UUID**: `EZC00003-EZC0-1000-8000-00805F9B34FB`
  - **Properties**: `WRITE`
  - **Written by**: The connecting device to signal it accepted the exchange.
  - **Value written**: `{ "accepted": true }` or `{ "accepted": false }` (encoded as UTF-8 bytes)

### 1.2 BLE Payload Format

The profile JSON must fit within the GATT MTU. We target `< 512 bytes` for the JSON payload to ensure reliable transfer.

```json
{
  "v": 1,
  "appId": "com.ezconnect.app",
  "profile": {
    "displayName": "Gautam Kumar",
    "headline": "Senior Android Developer",
    "company": "Acme Corp",
    "email": "gautam@example.com",
    "phone": "+91-9876543210",
    "linkedinUrl": "https://linkedin.com/in/gautam",
    "githubUrl": "https://github.com/Gautam7352",
    "portfolioUrl": "https://gautam.dev",
    "customLinks": [
      { "label": "Twitter", "url": "https://twitter.com/gautam" }
    ]
  },
  "exchangedAt": 1750000000000
}
```

*Note: `avatarUrl` can be included if it's a remote URL, but local `file://` URIs must be omitted.*

### 1.3 RSSI Proximity Threshold

To prevent spam and accidental connections in crowded rooms:
- **Visibility**: Only show devices with RSSI `> -65 dBm` in the "Nearby" list.
- **Auto-Prompting**: Only attempt auto-exchange prompts if RSSI `> -55 dBm` (physically very close).
- **Consent**: The user MUST always confirm an exchange via a dialog — **never auto-accept silently**.

### 1.4 Full Exchange Flow (Step-by-Step)

1. App opens Share screen (`/share`).
2. App starts `munim-bluetooth` advertising on `EZC00001` with a minimal beacon payload (just the Service UUID to be discoverable). The full JSON is hosted on the GATT server.
3. App simultaneously scans for `EZC00001`.
4. Discovered device appears in Nearby list if RSSI `> -65 dBm`.
5. User taps "Exchange" button on a discovered device card (acting as Central).
6. Central connects to Peripheral's GATT server.
7. Central reads `EZC00002` characteristic → receives Peripheral's profile JSON.
8. Central writes `{ "accepted": true }` to `EZC00003` characteristic on Peripheral.
9. Peripheral receives the write on `EZC00003`. It now knows Central accepted. Peripheral then connects back as Central to read the original Central's profile from its GATT server.
10. Both sides now have each other's profiles. They save the contact to the DB with `exchangeMethod: 'BLE'`.
11. Both show confirmation haptic feedback + "Exchange Complete" toast.

### 1.5 Error & Timeout Handling

- **Connection Timeout**: 8 seconds. If no connection, show toast: *"Move closer and try again"*.
- **GATT Read Failure**: Retry exactly once. If it fails again, show error: *"Failed to read profile"*.
- **Out of Range during Exchange**: If device disconnects mid-exchange, show *"Exchange interrupted"*. Do NOT save a partial or incomplete contact.
- **Bluetooth Off**: Show persistent prompt/bottom sheet to enable Bluetooth.

### 1.6 Permissions Required (Android 12+)

- `BLUETOOTH_SCAN` (runtime request)
- `BLUETOOTH_CONNECT` (runtime request)
- `BLUETOOTH_ADVERTISE` (runtime request)
- **Requirement**: All three must be granted before activating the Share screen's BLE features.
- **Strategy**: Request all three together in a single `requestMultiple` call. If any are denied, show a rationale dialog: *"Bluetooth is needed to exchange contacts without internet"*, then request again once. If permanently denied, deep-link to app settings.

---

## 2. NFC HCE (Host Card Emulation) Specification

We use `react-native-hce` for NFC one-way sharing (phone emulates a smart card).

### 2.1 Payload Format

- **NDEF Record Type**: MIME type `text/vcard` (or alternatively, an NDEF URI record pointing to a hosted web card if implemented later).
- **Format**: Standard vCard 3.0 format. (See `domain-types.md` for the `buildVCard` generator function).

### 2.2 Lifecycle

- **Registration**: HCE service is registered in `AndroidManifest.xml` via the `react-native-hce` config plugin.
- **Activation**: Activate HCE automatically when the Share screen is opened (no manual button press needed).
- **Deactivation**: Deactivate HCE immediately when navigating away from the Share screen.
- **Background Support**: Android supports HCE even when the screen is off (if unlocked, depending on OS settings), but our app only explicitly hosts the card while the Share screen is mounted.
