import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen({ route }) {
  const [partidas, setPartidas] = useState([]);
  const navigation = useNavigation();

  // Corrigido: useFocusEffect não pode receber função async diretamente
  useFocusEffect(
    useCallback(() => {
      async function carregarPartidas() {
        try {
          const emailUsuarioLogado = await AsyncStorage.getItem('usuarioLogado');
          const dados = await AsyncStorage.getItem('partidas');
          const agora = new Date();

          if (dados && emailUsuarioLogado) {
            let todas = JSON.parse(dados);

            todas = todas.filter(p => {
              const [dia, mes, ano] = p.data.split('/');
              const [hora, minuto] = p.hora.split(':');
              const dataHora = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:00`);
              return dataHora.getTime() + 60 * 60 * 1000 > agora.getTime(); // ainda válida
            });

            await AsyncStorage.setItem('partidas', JSON.stringify(todas));

            const filtradas = todas.filter(p =>
              p.emailUsuario === emailUsuarioLogado ||
              (p.jogadoresEmails && p.jogadoresEmails.includes(emailUsuarioLogado))
            );

            setPartidas(filtradas);
          } else {
            setPartidas([]);
          }
        } catch (error) {
          Alert.alert('Erro', 'Erro ao carregar partidas.');
        }
      }

      carregarPartidas();
    }, [])
  );

  useEffect(() => {
    const salvarPartida = async () => {
      if (route.params?.novaPartida) {
        try {
          const emailUsuarioLogado = await AsyncStorage.getItem('usuarioLogado');
          const dados = await AsyncStorage.getItem('partidas');
          const listaAtual = dados ? JSON.parse(dados) : [];

          const novaPartida = {
            ...route.params.novaPartida,
            id: route.params.novaPartida.id ?? Date.now(),
            valorUnitario: route.params.novaPartida.valorUnitario ?? 0,
          };

          const partidaJaExiste = listaAtual.some(p => p.id === novaPartida.id);
          if (!partidaJaExiste) {
            const novaLista = [...listaAtual, novaPartida];
            await AsyncStorage.setItem('partidas', JSON.stringify(novaLista));

            const minhasPartidas = novaLista.filter(p =>
              p.emailUsuario === emailUsuarioLogado ||
              (p.jogadoresEmails && p.jogadoresEmails.includes(emailUsuarioLogado))
            );

            setPartidas(minhasPartidas);
          }

          navigation.setParams({ novaPartida: undefined });
        } catch (error) {
          Alert.alert('Erro', 'Erro ao salvar a nova partida.');
        }
      }
    };

    salvarPartida();
  }, [route.params?.novaPartida]);

  const excluirPartida = async (id) => {
    Alert.alert('Excluir partida', 'Deseja realmente excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const dados = await AsyncStorage.getItem('partidas');
            const listaAtual = dados ? JSON.parse(dados) : [];
            const novaLista = listaAtual.filter(p => p.id !== id);
            await AsyncStorage.setItem('partidas', JSON.stringify(novaLista));

            const emailUsuarioLogado = await AsyncStorage.getItem('usuarioLogado');
            const minhasPartidas = novaLista.filter(p =>
              p.emailUsuario === emailUsuarioLogado ||
              (p.jogadoresEmails && p.jogadoresEmails.includes(emailUsuarioLogado))
            );

            setPartidas(minhasPartidas);
          } catch {
            Alert.alert('Erro', 'Erro ao excluir a partida.');
          }
        }
      }
    ]);
  };

  const sairDoApp = async () => {
    try {
      await AsyncStorage.removeItem('usuarioLogado');
      navigation.replace('Login');
    } catch {
      Alert.alert('Erro', 'Erro ao sair.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>

      <Text style={styles.title}>Bem-vindo ao Bola na Rede!</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={sairDoApp}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={styles.scrollViewContent}
        data={partidas}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma partida cadastrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text>{item.data} às {item.hora}</Text>
            <Text>{item.logradouro}, {item.numero} - {item.bairro}</Text>
            <Text>{item.cidade} - {item.uf}, CEP: {item.cep}</Text>
            {item.nomeQuadra && (
              <Text style={{ fontWeight: 'bold', marginTop: 4 }}>Quadra: {item.nomeQuadra}</Text>
            )}
            <Text>Jogadores: {item.quantidadeJogadores}</Text>
            <Text>Valor aluguel: R$ {item.valorAluguel?.toFixed(2) ?? '0.00'}</Text>
            <Text style={styles.valorUnitarioText}>
              Valor por jogador: R$ {(item.valorUnitario ?? 0).toFixed(2)}
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => excluirPartida(item.id)}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: '#34a853', marginTop: 5 }]}
              onPress={() => {
                const lat = parseFloat(item.latitude);
                const lng = parseFloat(item.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                  Linking.openURL(url);
                } else {
                  Alert.alert('Erro', 'Coordenadas inválidas.');
                }
              }}
            >
              <Text style={styles.deleteButtonText}>Ver no Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: '#fbbc05', marginTop: 5 }]}
              onPress={() => navigation.navigate('EditarPartida', { partida: item })}
            >
              <Text style={[styles.deleteButtonText, { color: '#000' }]}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CadastroPartida')}
      >
        <Text style={styles.buttonText}>Cadastrar Nova Partida</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    paddingTop: 60,
  },
  topSection: {
    width: '100%',
    height: 250,
    top: 20,
    backgroundColor: '#4587f2',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#111',
  },
  scrollViewContent: {
    paddingBottom: 80,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    position: 'absolute',
    bottom: 60,
    width: '90%',
    backgroundColor: '#4587f2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  valorUnitarioText: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#2a9d8f',
  },
  emptyText: {
    marginTop: 40,
    fontSize: 18,
    color: '#666',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 5,
    backgroundColor: '#4587f2',
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
