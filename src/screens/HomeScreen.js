import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen({ route }) {
  const [partidas, setPartidas] = useState([]);
  const navigation = useNavigation();

  // Carrega partidas do AsyncStorage filtrando pelo usuário logado
  useFocusEffect(
    useCallback(() => {
      const carregarPartidas = async () => {
        try {
          const emailUsuarioLogado = await AsyncStorage.getItem('usuarioLogado');
          const dados = await AsyncStorage.getItem('partidas');

          if (dados && emailUsuarioLogado) {
            const todas = JSON.parse(dados);
            const filtradas = todas.filter(p => p.emailUsuario === emailUsuarioLogado);
            setPartidas(filtradas);
          } else {
            setPartidas([]);
          }
        } catch (error) {
          Alert.alert('Erro ao carregar partidas.');
        }
      };

      carregarPartidas();
    }, [])
  );

  // Salva a nova partida recebida pelo parâmetro e limpa o parâmetro depois
  useEffect(() => {
    const salvarPartida = async () => {
      if (route.params?.novaPartida) {
        try {
          const emailUsuarioLogado = await AsyncStorage.getItem('usuarioLogado');

          const nova = {
            ...route.params.novaPartida,
            emailUsuario: emailUsuarioLogado,
          };

          const dados = await AsyncStorage.getItem('partidas');
          const listaAtual = dados ? JSON.parse(dados) : [];

          const novaLista = [...listaAtual, nova];
          await AsyncStorage.setItem('partidas', JSON.stringify(novaLista));

          // Atualiza o estado só com partidas do usuário
          const minhasPartidas = novaLista.filter(p => p.emailUsuario === emailUsuarioLogado);
          setPartidas(minhasPartidas);

          // Limpa o parâmetro para não re-executar o efeito
          navigation.setParams({ novaPartida: undefined });
        } catch (error) {
          Alert.alert('Erro ao salvar partida.');
        }
      }
    };

    salvarPartida();
  }, [route.params?.novaPartida]);

  // Função para excluir partida
  const excluirPartida = (id) => {
    Alert.alert(
      'Excluir partida',
      'Tem certeza que deseja excluir esta partida?',
      [
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
              const minhasPartidas = novaLista.filter(p => p.emailUsuario === emailUsuarioLogado);
              setPartidas(minhasPartidas);

              Alert.alert('Sucesso', 'Partida excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro ao excluir partida.');
            }
          }
        }
      ]
    );
  };

  // Função para sair do app
  const sairDoApp = async () => {
    try {
      await AsyncStorage.removeItem('usuarioLogado');
      navigation.replace('Login'); // ou navigation.navigate('Login')
    } catch (error) {
      Alert.alert('Erro ao sair.');
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


      {partidas.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma partida cadastrada.</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.scrollViewContent}
          data={partidas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text>{item.data} às {item.hora}</Text>
              <Text>{item.logradouro}, {item.bairro}</Text>
              <Text>{item.cidade} - {item.uf}, CEP: {item.cep}</Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => excluirPartida(item.id)}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

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
    bottom: 40,
    backgroundColor: '#4587f2',
    width: '90%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
 logoutButton: {
  marginTop: 15,
  backgroundColor: '#4587f2',  // mesma cor do botão cadastrar
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
  width: '90%',
},

logoutText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
  textAlign: 'center',
},
  card: {
    backgroundColor: '#e4e9ff',
    padding: 15,
    marginVertical: 8,
    width: '90%',
    borderRadius: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#e63946',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 40,
    fontSize: 18,
    color: '#888',
  },
});
