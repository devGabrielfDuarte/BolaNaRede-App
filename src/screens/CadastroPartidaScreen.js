import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput
} from 'react-native';
import { auth } from '../config/firebaseConfig';

export default function CadastroPartidaScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  const buscarEnderecoPorCep = async (cepBusca) => {
    if (cepBusca.length !== 8) return;
    try {
      setLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cepBusca}/json/`);
      const data = await response.json();
      if (data.erro) {
        Alert.alert('CEP inválido');
        setLogradouro('');
        setBairro('');
        setCidade('');
        setUf('');
      } else {
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setUf(data.uf || '');
      }
    } catch (error) {
      Alert.alert('Erro ao buscar CEP', error.message);
    } finally {
      setLoadingCep(false);
    }
  };
  
  const formatarData = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
    };

  const formatarHora = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 4);
    if (numeros.length <= 2) return numeros;
    return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
  };


  const handleCepChange = (text) => {
    const onlyNumbers = text.replace(/\D/g, '');
    setCep(onlyNumbers);
    if (onlyNumbers.length === 8) {
      buscarEnderecoPorCep(onlyNumbers);
    } else {
      setLogradouro('');
      setBairro('');
      setCidade('');
      setUf('');
    }
  };

  const salvarPartida = async () => {
    if (!nome || !data || !hora) {
      Alert.alert('Erro', 'Preencha os campos nome, data e hora.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const partida = {
        id: Date.now(),
        nome,
        data,
        hora,
        cep,
        logradouro,
        bairro,
        cidade,
        uf,
        emailUsuario: user.email,
      };

      // Aqui você poderia salvar no Firestore se quiser
      // mas no momento só vai passar para Home via params

      navigation.navigate('Home', { novaPartida: partida });
    } catch (error) {
      Alert.alert('Erro ao salvar partida', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Nova Partida</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da partida"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Data (dd/mm/aaaa)"
        value={data}
        onChangeText={(text) => setData(formatarData(text))}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Hora (hh:mm)"
        value={hora}
        onChangeText={(text) => setHora(formatarHora(text))}
        keyboardType="numeric"
        />


      <TextInput
        style={styles.input}
        placeholder="CEP (somente números)"
        keyboardType="numeric"
        value={cep}
        onChangeText={handleCepChange}
        maxLength={8}
      />

      {loadingCep ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Logradouro"
            value={logradouro}
            onChangeText={setLogradouro}
          />
          <TextInput
            style={styles.input}
            placeholder="Bairro"
            value={bairro}
            onChangeText={setBairro}
          />
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={cidade}
            onChangeText={setCidade}
          />
          <TextInput
            style={styles.input}
            placeholder="UF"
            value={uf}
            onChangeText={setUf}
            maxLength={2}
          />
        </>
      )}

      <Button title="Salvar Partida" onPress={salvarPartida} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
});
