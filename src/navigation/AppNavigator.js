import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/utils/TabBarIcon';
import TabBarText from '../components/utils/TabBarText';
import Inicio from '../screens/Inicio';
import Detalles from '../screens/Detalles';
import Perfil from '../screens/Perfil';
import Loading from '../screens/utils/Loading';
import Login from '../screens/auth/Login';
import { AuthContext } from '../provider/AuthProvider';
import CrearPedido from '../screens/CrearPedido';
import Clientes from '../screens/SeleccionarClientes';
import TiposPedidos from '../screens/SeleccionarTipoPedido';
import SeleccionarDireccion from '../screens/SeleccionarDireccion';
import VerPedido from '../screens/VerPedido';
import AnotarEntregados from '../screens/AnotarEntregados';

const AuthStack = createNativeStackNavigator();
const Auth = () => {
	return (
		<AuthStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<AuthStack.Screen name="Login" component={Login} />
		</AuthStack.Navigator>
	);
};

const MainStack = createNativeStackNavigator();
const Main = () => {
	return (
		<MainStack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<MainStack.Screen name="Inicio" component={Inicio} />
			<MainStack.Screen name="CrearPedido" component={CrearPedido} />
			<MainStack.Screen name="AnotarEntregados" component={AnotarEntregados} />
			<MainStack.Screen name="VerPedido" component={VerPedido} />
			<MainStack.Screen name="Clientes" component={Clientes} />
			<MainStack.Screen name="TiposPedidos" component={TiposPedidos} />
			<MainStack.Screen name="SeleccionarDireccion" component={SeleccionarDireccion} />
		</MainStack.Navigator>
	);
};

const Tabs = createBottomTabNavigator();
const MainTabs = () => {
	return (
		<Tabs.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					borderTopColor: '#c0c0c0',
					backgroundColor: '#ffffff',
				},
			}}
		>
			<Tabs.Screen
				name="MainTabs"
				component={Main}
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Inicio" />,
					tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={'md-home'} />,
					tabBarHideOnKeyboard: true,
				}}
			/>
			<Tabs.Screen
				name="Pedidos"
				component={Detalles}
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Pedidos" />,
					tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={'ios-information-circle'} />,
				}}
			/>
			<Tabs.Screen
				name="Perfil"
				component={Perfil}
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Perfil" />,
					tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={'person'} />,
				}}
			/>
		</Tabs.Navigator>
	);
};

export default () => {
	const { user } = useContext(AuthContext);
	const [loading, setLoading] = React.useState(true);
	setTimeout(() => {
		setLoading(false);
	}, 1500);

	return (
		<NavigationContainer>
			{!user && !loading && <Auth />}
			{loading && <Loading />}
			{user && !loading && <MainTabs />}
		</NavigationContainer>
	);
};
