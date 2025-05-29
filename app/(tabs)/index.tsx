import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  const [favorito, setFavorito] = useState('');

  const salvarFavorito = async (valor: string) => {
    try {
      await AsyncStorage.setItem('timeFavorito', valor);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o time favorito.');
    }
  };

  const carregarFavorito = async () => {
    try {
      const valor = await AsyncStorage.getItem('timeFavorito');
      if (valor !== null) {
        setFavorito(valor);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar o time favorito.');
    }
  };

  useEffect(() => {
    carregarFavorito();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>Digite o nome do seu time favorito abaixo:</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Ex: Flamengo"
        value={favorito}
        onChangeText={(text) => {
          setFavorito(text);
          salvarFavorito(text);
        }}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerImage: {
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginVertical: 16,
    marginHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
