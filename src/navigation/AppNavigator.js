import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/utils/TabBarIcon';
import TabBarText from '../components/utils/TabBarText';
import Inicio from '../screens/Inicio';
import PantallaTest from '../screens/PantallaTest';
import Detalles from '../screens/Detalles';
import Perfil from '../screens/Perfil';
import Loading from '../screens/utils/Loading';
import Login from '../screens/auth/Login';
import { AuthContext } from '../provider/AuthProvider';

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
			<MainStack.Screen name="MainTabs" component={MainTabs} />
			<MainStack.Screen name="PantallaTest" component={PantallaTest} />
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
				name="Inicio"
				component={Inicio}
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Inicio" />,
					tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={'md-home'} />,
				}}
			/>
			<Tabs.Screen
				name="Pedidos"
				component={Detalles}
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Detalles" />,
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

	return (
		<NavigationContainer>
			{!user && <Auth />}
			{/* <Loading /> */}
			{user && <Main />}
		</NavigationContainer>
	);
};
