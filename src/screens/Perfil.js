import React, { useContext } from 'react';
import { View } from 'react-native';
import { Layout, Text, Button } from 'react-native-rapi-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../provider/AuthProvider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ({ navigation }) {
	const { user, setUser } = useContext(AuthContext);

	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<View></View>

				<View style={{ alignItems: 'center', backgroundColor: '#ececec', borderRadius: 15, padding: 15 }}>
					<Text>Haz iniciado sesión como:</Text>
					<View
						style={{
							backgroundColor: '#e0e0e0',
							borderRadius: 15,
							padding: 15,
							alignItems: 'center',
							marginTop: 10,
						}}
					>
						<Text>{` ${user.nombre} ${user.apellido ? user.apellido : ''}`}</Text>
					</View>

					{(user.ci || user.rut) && (
						<View
							style={{
								backgroundColor: '#e0e0e0',
								borderRadius: 15,
								padding: 10,
								justifyContent: 'center',
								marginTop: 5,
							}}
						>
							<Text>
								<MaterialCommunityIcons name="fingerprint" size={20} color="black" />
								{user.ci ? user.ci : user.rut}
							</Text>
						</View>
					)}

					{user.usuario && (
						<View
							style={{
								backgroundColor: '#e0e0e0',
								borderRadius: 15,
								padding: 10,
								justifyContent: 'center',
								marginTop: 5,
							}}
						>
							<Text>
								<MaterialCommunityIcons name="account" size={20} color="black" />
								{user.usuario}
							</Text>
						</View>
					)}
					{user.unidad && (
						<View
							style={{
								backgroundColor: '#e0e0e0',
								borderRadius: 15,
								padding: 10,
								alignItems: 'center',
								justifyContent: 'center',
								marginTop: 5,
							}}
						>
							<Text>
								<MaterialCommunityIcons name="truck" size={20} color="black" />
								{user.unidad.nombre}
							</Text>
						</View>
					)}
					{user.telefono ? (
						<View
							style={{
								backgroundColor: '#e0e0e0',
								borderRadius: 15,
								padding: 10,
								alignItems: 'center',
								justifyContent: 'center',
								marginTop: 5,
							}}
						>
							<Text>{user.telefono}</Text>
						</View>
					) : (
						<></>
					)}

					{user.email ? (
						<View
							style={{
								backgroundColor: '#e0e0e0',
								borderRadius: 15,
								padding: 10,
								alignItems: 'center',
								justifyContent: 'center',
								marginTop: 5,
							}}
						>
							<Text>{user.email}</Text>
						</View>
					) : (
						<></>
					)}
				</View>
				<Button
					status="danger"
					text="Cerrar sesión"
					onPress={() => {
						setUser(null);
						AsyncStorage.removeItem('token');
						AsyncStorage.removeItem('usuario');
					}}
					style={{
						marginBottom: 20,
					}}
				/>
			</View>
		</Layout>
	);
}
