import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CadastroPartidaScreen() {
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [nomeQuadra, setNomeQuadra] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [valorAluguel, setValorAluguel] = useState('');
  const [jogadoresEmails, setJogadoresEmails] = useState([]);
  const [emailJogador, setEmailJogador] = useState('');

  const buscarEnderecoECoordenadas = async () => {
    if (cep.length !== 8) {
      Alert.alert('CEP inválido', 'Informe um CEP com 8 dígitos.');
      return;
    }

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP digitado.');
        return;
      }

      setLogradouro(response.data.logradouro || '');
      setBairro(response.data.bairro || '');
      setCidade(response.data.localidade || '');
      setUf(response.data.uf || '');

      const enderecoCompleto = `${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade}, ${response.data.uf}, Brasil`;
      const geocodeResponse = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(enderecoCompleto)}&key=30f0b13f4ebc4258a7bb19498a60abc4`
      );

      if (geocodeResponse.data.results.length > 0) {
        const location = geocodeResponse.data.results[0].geometry;
        setLatitude(location.lat.toString());
        setLongitude(location.lng.toString());
      } else {
        Alert.alert('Localização não encontrada para esse endereço.');
      }

    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar endereço ou coordenadas.');
    }
  };

  const abrirNoGoogleMaps = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Localização não disponível', 'Preencha o CEP e aguarde o carregamento da localização.');
    }
  };

  const adicionarJogador = () => {
    if (emailJogador.trim() === '') {
      Alert.alert('Campo vazio', 'Informe o e-mail do jogador.');
      return;
    }
    setJogadoresEmails([...jogadoresEmails, emailJogador.trim()]);
    setEmailJogador('');
  };

  const removerJogador = (index) => {
    const novaLista = [...jogadoresEmails];
    novaLista.splice(index, 1);
    setJogadoresEmails(novaLista);
  };

  const formatarData = (text) => {
    let valor = text.replace(/\D/g, '');
    if (valor.length >= 3 && valor.length <= 4) {
      valor = valor.replace(/^(\d{2})(\d{1,2})/, '$1/$2');
    } else if (valor.length >= 5) {
      valor = valor.replace(/^(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    }
    setData(valor);
  };

  const formatarHora = (text) => {
    let valor = text.replace(/\D/g, '');
    if (valor.length >= 3) {
      valor = valor.replace(/^(\d{2})(\d{1,2})/, '$1:$2');
    }
    setHora(valor);
  };

  const calcularValorUnitario = () => {
    const aluguel = parseFloat(valorAluguel.replace(',', '.'));
    const qtdJogadores = jogadoresEmails.length + 1;
    if (!isNaN(aluguel) && qtdJogadores > 0) {
      return (aluguel / qtdJogadores).toFixed(2);
    }
    return '0.00';
  };

  const salvarPartida = async () => {
    if (!nome || !data || !hora || !cep || !valorAluguel || !numero || !nomeQuadra) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
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
      const partidas = dados ? JSON.parse(dados) : [];

      const conflito = partidas.find(p =>
        p.data === data &&
        p.hora === hora &&
        p.cep === cep
      );

      if (conflito) {
        Alert.alert('Conflito de Partida', 'Já existe uma partida cadastrada com essa data, hora e local.');
        return;
      }

      const emailUsuarioLogado = await AsyncStorage.getItem('usuarioLogado');

      const novaPartida = {
        id: Date.now(),
        nome,
        data,
        hora,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        nomeQuadra,
        latitude,
        longitude,
        valorAluguel: parseFloat(valorAluguel.replace(',', '.')),
        quantidadeJogadores: jogadoresEmails.length + 1,
        jogadoresEmails,
        valorUnitario: parseFloat(calcularValorUnitario()),
        emailUsuario: emailUsuarioLogado,
      };

      await AsyncStorage.setItem('partidas', JSON.stringify([...partidas, novaPartida]));

      Alert.alert('Sucesso', 'Partida cadastrada com sucesso!');
      navigation.navigate('Home', { novaPartida });

    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao salvar partida.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Partida</Text>

      <TextInput style={styles.input} placeholder="Nome da Partida" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Data (DD/MM/AAAA)" keyboardType="numeric" value={data} onChangeText={formatarData} maxLength={10} />
      <TextInput style={styles.input} placeholder="Hora (HH:MM)" keyboardType="numeric" value={hora} onChangeText={formatarHora} maxLength={5} />
      <TextInput style={styles.input} placeholder="CEP" keyboardType="numeric" value={cep} onChangeText={setCep} maxLength={8} onBlur={buscarEnderecoECoordenadas} />

      <TextInput style={styles.input} placeholder="Logradouro" value={logradouro} onChangeText={setLogradouro} />
      <TextInput style={styles.input} placeholder="Número" value={numero} onChangeText={setNumero} />
      <TextInput style={styles.input} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
      <TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade} />
      <TextInput style={styles.input} placeholder="UF" value={uf} onChangeText={setUf} maxLength={2} />
      <TextInput style={styles.input} placeholder="Nome da Quadra" value={nomeQuadra} onChangeText={setNomeQuadra} />

      <Text style={styles.coords}>Latitude: {latitude} | Longitude: {longitude}</Text>

      <TouchableOpacity style={styles.mapsButton} onPress={abrirNoGoogleMaps}>
        <Text style={styles.mapsButtonText}>Ver no Google Maps</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Valor do Aluguel" keyboardType="numeric" value={valorAluguel} onChangeText={setValorAluguel} />

      <View style={styles.addJogadorContainer}>
        <TextInput style={styles.inputMenor} placeholder="E-mail do jogador" value={emailJogador} onChangeText={setEmailJogador} />
        <TouchableOpacity style={styles.addButton} onPress={adicionarJogador}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {jogadoresEmails.length > 0 && (
        <FlatList
          data={jogadoresEmails}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.jogadorItem}>
              <Text>{item}</Text>
              <TouchableOpacity onPress={() => removerJogador(index)}>
                <Text style={{ color: 'red', marginLeft: 10 }}>Remover</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Text style={styles.valorUnitario}>Valor por jogador: R$ {calcularValorUnitario()}</Text>

      <TouchableOpacity style={styles.button} onPress={salvarPartida}>
        <Text style={styles.buttonText}>Salvar Partida</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputMenor: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addJogadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4587f2',
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  jogadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#eaf0ff',
    borderRadius: 8,
    marginVertical: 4,
  },
  button: {
    backgroundColor: '#4587f2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valorUnitario: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#2a9d8f',
  },
  coords: {
    marginVertical: 8,
    color: '#555',
  },
  mapsButton: {
    backgroundColor: '#34A853',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  mapsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
