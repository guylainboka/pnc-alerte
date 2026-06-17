/**
 * Exemple complet — Écran d'alerte SOS dans l'application mobile
 * =================================================================
 * Montre comment l'application mobile existante utilise le SDK @pnc/mobile-sdk
 * pour envoyer une alerte SOS au Centre de Commandement PNC.
 *
 * À adapter selon la structure de votre application mobile.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { usePNC } from '@pnc/mobile-sdk/react';

const ALERT_TYPES = [
  { id: 'vol', label: 'Vol', icon: '💰' },
  { id: 'agression', label: 'Agression', icon: '⚠️' },
  { id: 'accident', label: 'Accident', icon: '🚗' },
  { id: 'incendie', label: 'Incendie', icon: '🔥' },
  { id: 'autre', label: 'Autre', icon: '❓' },
];

export function SOSAlertScreen() {
  const { citizen, sendSOS, loading } = usePNC();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSOS = async () => {
    if (!selectedType) {
      Alert.alert('Type requis', 'Sélectionnez le type d\'alerte');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Description requise', 'Décrivez la situation');
      return;
    }

    setSending(true);
    try {
      // Récupérer la position GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = null;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }

      // Envoyer l'alerte au Centre de Commandement
      const alert = await sendSOS({
        type: selectedType,
        description: description.trim(),
        location: locationText.trim() || 'Position GPS',
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });

      Alert.alert(
        '✅ Alerte envoyée',
        `Votre alerte ${alert.reference} a été reçue par le Centre de Commandement PNC.\n\n` +
        `Priorité: ${alert.priority}\n` +
        `Les secours sont en route. Restez en sécurité.`,
        [{ text: 'OK', onPress: () => { setDescription(''); setLocationText(''); setSelectedType(null); } }]
      );
    } catch (e: any) {
      Alert.alert('❌ Erreur', e.message || 'Impossible d\'envoyer l\'alerte');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 Alerte SOS</Text>
      <Text style={styles.subtitle}>
        {citizen ? `Connecté: ${citizen.firstName} ${citizen.lastName}` : 'Mode anonyme'}
      </Text>

      <Text style={styles.label}>Type d'urgence</Text>
      <View style={styles.typeGrid}>
        {ALERT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.typeButton, selectedType === t.id && styles.typeButtonActive]}
            onPress={() => setSelectedType(t.id)}
          >
            <Text style={styles.typeIcon}>{t.icon}</Text>
            <Text style={styles.typeLabel}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        placeholder="Décrivez ce qui se passe..."
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Lieu (optionnel)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Marché Central, Gombe"
        value={locationText}
        onChangeText={setLocationText}
      />

      <TouchableOpacity style={styles.sosButton} onPress={handleSOS} disabled={sending}>
        {sending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.sosButtonText}>ENVOYER L'ALERTE SOS</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>
        Votre position GPS et votre identité seront transmises au Centre de Commandement.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a5632', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeButton: {
    flexBasis: '31%', flexGrow: 0, padding: 12, borderRadius: 12,
    backgroundColor: 'white', alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  typeButtonActive: { borderColor: '#1a5632', backgroundColor: '#e8f5ee' },
  typeIcon: { fontSize: 28 },
  typeLabel: { fontSize: 12, color: '#333', marginTop: 4 },
  input: {
    backgroundColor: 'white', borderRadius: 12, padding: 14, fontSize: 16,
    borderWidth: 1, borderColor: '#ddd', textAlignVertical: 'top',
  },
  sosButton: {
    backgroundColor: '#dc2626', borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 25,
  },
  sosButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  footer: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 15 },
});
