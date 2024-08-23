import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

// Inisialisasi NFC Manager
NfcManager.start();

export default function App() {
  const [text, setText] = useState('');
  const [scannedText, setScannedText] = useState('');

  useEffect(() => {
    // Cleanup saat komponen unmount
    return () => {
      NfcManager.cancelTechnologyRequest(); // Hentikan permintaan teknologi saat unmount
      NfcManager.stop(); // Hentikan NFC Manager
    };
  }, []);

  // Fungsi untuk menulis teks ke NFC tag
  const writeNfc = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.textRecord(text)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert('Sukses', 'Pesan ditulis ke NFC tag');
      }
    } catch (ex) {
      console.warn(ex);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  // Fungsi untuk membaca teks dari NFC tag
  const readNfc = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const message = tag.ndefMessage[0];
        const decoded = Ndef.text.decodePayload(message.payload);
        setScannedText(decoded);
        Alert.alert('Pesan Dibaca', decoded);
      } else {
        Alert.alert('Error', 'NFC tag tidak memiliki pesan NDEF');
      }
    } catch (ex) {
      console.warn(ex);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Masukkan teks untuk dikirim"
        value={text}
        onChangeText={setText}
        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 20, padding: 10 }}
      />
      <Button title="Kirim melalui NFC" onPress={writeNfc} />
      <View style={{ marginTop: 40 }}>
        <Button title="Baca dari NFC" onPress={readNfc} />
        {scannedText ? (
          <Text style={{ marginTop: 20 }}>Pesan Diterima: {scannedText}</Text>
        ) : null}
      </View>
    </View>
  );
}
