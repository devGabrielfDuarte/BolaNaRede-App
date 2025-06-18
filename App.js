import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox } from 'react-native';
import CadastroPartidaScreen from './src/screens/CadastroPartidaScreen';
import EditarPartidaScreen from './src/screens/EditarPartidaScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';


// Ignora o aviso de VirtualizedLists aninhadas
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CadastroPartida" component={CadastroPartidaScreen} />
        <Stack.Screen name="EditarPartida" component={EditarPartidaScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
