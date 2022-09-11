import React, { useContext } from 'react';
import { View } from 'react-native';
import { Layout, Text, Button } from 'react-native-rapi-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../provider/AuthProvider';

export default function ({ navigation }) {
	const { user, setUser } = useContext(AuthContext);

	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Text>Logeado como {`${user.nombre} ${user.apellido}`}</Text>
				<Button
					status="danger"
					text="Cerrar sesión"
					onPress={() => {
						setUser(null);
						AsyncStorage.removeItem('token');
						AsyncStorage.removeItem('usuario');
					}}
					style={{
						marginTop: 10,
					}}
				/>
			</View>
		</Layout>
	);
}
