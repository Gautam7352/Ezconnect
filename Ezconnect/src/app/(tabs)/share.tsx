import React, { useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useShareStore } from '../../stores/use-share-store';
import { BleDeviceCard } from '../../components/ble-device-card';
import { QrDisplay } from '../../components/qr-display';
import { usePersonaStore } from '../../stores/use-persona-store';
import { buildVCard } from '../../types/domain';

export default function ShareScreen() {
  const { 
    isScanning, 
    isAdvertising, 
    discoveredDevices, 
    startScanning, 
    stopScanning, 
    startAdvertising, 
    stopAdvertising 
  } = useShareStore();

  useEffect(() => {
    // Component mount logic like checking permissions could go here.
    return () => {
      stopScanning();
      stopAdvertising();
    };
  }, []);

  const { activePersona } = usePersonaStore();
  
  const generateVCard = () => {
    if (!activePersona) return 'ezconnect:fallback';
    return buildVCard(activePersona);
  };

  return (
    <View style={styles.container} testID="share-screen">
      <Text style={styles.title}>Share Profile</Text>
      
      <View style={styles.qrSection}>
        <QrDisplay value={generateVCard()} />
      </View>

      <View style={styles.controls}>
        <Button 
          title={isScanning ? "Stop Scanning" : "Start Scanning"} 
          onPress={isScanning ? stopScanning : startScanning} 
          testID="scan-button"
        />
        <Button 
          title={isAdvertising ? "Stop Advertising" : "Start Advertising"} 
          onPress={isAdvertising ? stopAdvertising : () => startAdvertising(generateVCard())} 
          testID="advertise-button"
        />
      </View>

      <Text style={styles.subtitle}>Discovered Devices</Text>
      <FlatList
        data={discoveredDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BleDeviceCard id={item.id} name={item.name} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No devices found yet.</Text>}
        testID="device-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
});
