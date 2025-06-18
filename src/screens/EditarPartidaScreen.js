import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function EditarPartidaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { partida } = route.params;

  const [nome, setNome] = useState(partida.nome);
  const [nomeQuadra, setNomeQuadra] = useState(partida.nomeQuadra || '');
  const [data, setData] = useState(partida.data);
  const [hora, setHora] = useState(partida.hora);
  const [cep, setCep] = useState(partida.cep);
  const [numero, setNumero] = useState(partida.numero || '');
  const [latitude, setLatitude] = useState(partida.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(partida.longitude?.toString() || '');
  const [valorAluguel, setValorAluguel] = useState(partida.valorAluguel.toString());
  const [jogadorEmail, setJogadorEmail] = useState('');
  const [jogadores, setJogadores] = useState(partida.jogadoresEmails || []);
  const [valorUnitario, setValorUnitario] = useState(partida.valorUnitario || 0);

  useEffect(() => {
    calcularValorPorJogador(jogadores.length);
  }, [valorAluguel, jogadores.length]);

  const calcularValorPorJogador = (totalJogadores) => {
    const total = parseFloat(valorAluguel) || 0;
    if (totalJogadores > 0) {
      setValorUnitario(total / totalJogadores);
    } else {
      setValorUnitario(0);
    }
  };

  const adicionarJogador = () => {
    if (jogadorEmail.trim() === '') {
      Alert.alert('Erro', 'Informe o e-mail do jogador.');
      return;
    }

    if (jogadores.includes(jogadorEmail.trim())) {
      Alert.alert('Erro', 'Jogador já adicionado.');
      return;
    }

    const novaLista = [...jogadores, jogadorEmail.trim()];
    setJogadores(novaLista);
    calcularValorPorJogador(novaLista.length);
    setJogadorEmail('');
  };

  const removerJogador = (email) => {
    const novaLista = jogadores.filter(j => j !== email);
    setJogadores(novaLista);
    calcularValorPorJogador(novaLista.length);
  };

  const salvarEdicao = async () => {
    if (!nome || !nomeQuadra || !data || !hora || !cep || !numero || !valorAluguel || jogadores.length === 0 || !latitude || !longitude) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios e adicione ao menos um jogador.');
      return;
    }

    const [dia, mes, ano] = data.split('/');
    const dataSelecionada = new Date(`${ano}-${mes}-${dia}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (isNaN(dataSelecionada.getTime())) {
      Alert.alert('Data inválida', 'Formato de data inválido. Use DD/MM/AAAA.');
      return;
    }

    if (dataSelecionada < hoje) {
      Alert.alert('Data inválida', 'A data da partida não pode ser anterior a hoje.');
      return;
    }

    try {
      const dados = await AsyncStorage.getItem('partidas');
      let listaAtual = dados ? JSON.parse(dados) : [];

      const conflito = listaAtual.find(p =>
        p.id !== partida.id &&
        p.data === data &&
        p.hora === hora &&
        p.cep === cep &&
        p.numero === numero
      );

      if (conflito) {
        Alert.alert('Conflito de Partida', 'Já existe uma partida cadastrada com o mesmo local, número, data e hora.');
        return;
      }

      listaAtual = listaAtual.map(p => {
        if (p.id === partida.id) {
          return {
            ...p,
            nome,
            nomeQuadra,
            data,
            hora,
            cep,
            numero,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            valorAluguel: parseFloat(valorAluguel),
            jogadoresEmails: jogadores,
            quantidadeJogadores: jogadores.length,
            valorUnitario,
          };
        }
        return p;
      });

      await AsyncStorage.setItem('partidas', JSON.stringify(listaAtual));

      Alert.alert('Sucesso', 'Partida atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar alterações.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome da Partida:</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Nome da Quadra:</Text>
      <TextInput
        style={styles.input}
        value={nomeQuadra}
        onChangeText={setNomeQuadra}
        placeholder="Nome da quadra"
      />

      <Text style={styles.label}>Data:</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={setData}
        placeholder="DD/MM/AAAA"
      />

      <Text style={styles.label}>Hora:</Text>
      <TextInput
        style={styles.input}
        value={hora}
        onChangeText={setHora}
        placeholder="HH:MM"
      />

      <Text style={styles.label}>CEP:</Text>
      <TextInput
        style={styles.input}
        value={cep}
        onChangeText={setCep}
        placeholder="00000-000"
      />

      <Text style={styles.label}>Número do Endereço:</Text>
      <TextInput
        style={styles.input}
        value={numero}
        onChangeText={setNumero}
        keyboardType="numeric"
        placeholder="Ex: 123"
      />

      <Text style={styles.label}>Latitude:</Text>
      <TextInput
        style={styles.input}
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
        placeholder="Ex: -22.9035"
      />

      <Text style={styles.label}>Longitude:</Text>
      <TextInput
        style={styles.input}
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
        placeholder="Ex: -43.2096"
      />

      <Text style={styles.label}>Valor do Aluguel da Quadra:</Text>
      <TextInput
        style={styles.input}
        value={valorAluguel}
        onChangeText={setValorAluguel}
        keyboardType="numeric"
        placeholder="Ex: 150.00"
      />

      <Text style={styles.label}>Adicionar Jogador (e-mail):</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={jogadorEmail}
          onChangeText={setJogadorEmail}
          placeholder="email@exemplo.com"
        />
        <TouchableOpacity style={styles.addButton} onPress={adicionarJogador}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {jogadores.length > 0 && (
        <View style={styles.jogadoresContainer}>
          <Text style={styles.label}>Jogadores:</Text>
          {jogadores.map((email, index) => (
            <View key={index} style={styles.jogadorItem}>
              <Text>{email}</Text>
              <TouchableOpacity onPress={() => removerJogador(email)}>
                <Text style={styles.removerText}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.label}>Valor por Jogador: R$ {valorUnitario.toFixed(2)}</Text>

      <TouchableOpacity style={styles.button} onPress={salvarEdicao}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#4587f2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  jogadoresContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  jogadorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  removerText: {
    color: 'red',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#34a853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
