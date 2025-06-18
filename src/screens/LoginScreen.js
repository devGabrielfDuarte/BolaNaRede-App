// src/screens/LoginScreen.js

import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos corretamente.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //  SALVA O E-MAIL DO USUÁRIO LOGADO NO ASYNC STORAGE
      await AsyncStorage.setItem('usuarioLogado', user.email);

      // NAVEGA PARA A HOME
      navigation.replace('Home');
    } catch (error) {
      let mensagem = 'Erro no login. Verifique os dados.';
      if (error.code === 'auth/user-not-found') {
        mensagem = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        mensagem = 'Senha incorreta.';
      }
      Alert.alert('Erro', mensagem);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image source={require('../../assets/logo.png')} style={styles.image} />
      </View>

      <Text style={styles.title}>Bola na Rede</Text>
      <Text style={styles.subtitle}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin}>
        <Text style={styles.loginText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Ainda não possui uma conta?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Cadastre-se
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
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
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    color: '#111',
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    marginVertical: 10,
  },
  loginButton: {
    backgroundColor: '#4587f2',
    paddingVertical: 12,
    width: '80%',
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    color: '#333',
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
