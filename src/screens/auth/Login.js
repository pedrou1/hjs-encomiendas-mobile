import React, { useState, useContext } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Image, StyleSheet, Alert } from 'react-native';
import { Layout, Text, TextInput, Button, themeColor } from 'react-native-rapi-ui';
import * as servicioUsuarios from '../../services/usuarios';
import * as Constantes from '../../utils/Constantes';
import { AuthContext } from '../../provider/AuthProvider';
import { Formik } from 'formik';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as servicioUnidad from '../../services/unidad';

export default function ({ navigation }) {
	const { user, setUser } = useContext(AuthContext);
	const [loading, setLoading] = useState(false);

	const formSchema = yup.object({
		usuario: yup
			.string('Introduce tu nombre de usuario')
			.min(4, 'El nombre de usuario debe tener una longitud mínima de 4 caracteres')
			.required('Introduce tu nombre de usuario'),
		password: yup
			.string('Introduce tu contraseña')
			.min(6, 'La contraseña debe tener una longitud mínima de 6 caracteres')
			.required('Introduce tu contraseña'),
	});

	return (
		<KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
			<Layout>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
					}}
				>
					<Formik
						initialValues={{
							usuario: '',
							password: '',
						}}
						validationSchema={formSchema}
						onSubmit={async (values, e) => {
							setLoading(true);
							const res = await servicioUsuarios.iniciarSesion(values);
							if (!res) Alert.alert('Error', 'Ha ocurrido un error, contacte al administrador');

							if (res && res.operationResult == Constantes.SUCCESS) {
								if (!res.usuario.idCategoria == Constantes.PERMISO_ADMINISTRADOR || !res.usuario.idCategoria == Constantes.PERMISO_CHOFER) {
									Alert.alert('Error', 'No tienes el permiso necesario para ingresar, contacte al administrador');
									setLoading(false);
									return;
								}
								await AsyncStorage.setItem('token', res.jwtToken);
								const unidadUsuario = await servicioUnidad.otenerUnidadDeChofer(res.usuario.idUsuario);
								if (unidadUsuario) {
									await AsyncStorage.setItem('usuario', JSON.stringify({ ...res.usuario, unidad: unidadUsuario }));
									setUser({ ...res.usuario, unidad: unidadUsuario });
								} else {
									await AsyncStorage.removeItem('token');
									Alert.alert('Error', 'No tienes una unidad asignada, contacte al administrador');
								}
							} else if (res.operationResult == Constantes.INVALIDUSER) {
								e.setFieldError('password', 'Usuario o contraseña incorrecta');
							}
							setLoading(false);
						}}
					>
						{(props) => (
							<>
								<View
									style={{
										flex: 1,
										justifyContent: 'center',
										alignItems: 'center',
										backgroundColor: themeColor.white100,
									}}
								>
									<Image
										resizeMode="contain"
										style={{
											height: 220,
											width: 220,
										}}
										source={require('../../../assets/login.png')}
									/>
								</View>
								<View
									style={{
										flex: 3,
										paddingHorizontal: 20,
										paddingBottom: 20,
										backgroundColor: themeColor.white,
									}}
								>
									<Text
										fontWeight="bold"
										style={{
											alignSelf: 'center',
											padding: 30,
										}}
										size="h3"
									>
										Iniciar Sesión
									</Text>
									<Text>Usuario</Text>
									<TextInput
										containerStyle={{ marginTop: 15 }}
										placeholder="Introduce tu usuario"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										onChangeText={props.handleChange('usuario')}
										value={props.values.usuario}
										onBlur={props.handleBlur('usuario')}
									/>
									<Text size="sm" style={styles.error}>
										{props.touched.usuario && props.errors.usuario}
									</Text>
									<Text style={{ marginTop: 15 }}>Contraseña</Text>
									<TextInput
										containerStyle={{ marginTop: 15 }}
										placeholder="Introduce tu contraseña"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										secureTextEntry={true}
										onChangeText={props.handleChange('password')}
										value={props.values.password}
										onBlur={props.handleBlur('password')}
									/>
									<Text size="sm" style={styles.error}>
										{props.touched.password && props.errors.password}
									</Text>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											marginTop: 10,
											justifyContent: 'center',
										}}
									>
										<Button
											text={loading ? 'Cargando' : 'Continuar'}
											onPress={props.handleSubmit}
											style={{
												marginTop: 20,
											}}
											disabled={loading}
										/>
									</View>
								</View>
							</>
						)}
					</Formik>
				</ScrollView>
			</Layout>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	error: {
		color: 'red',
		marginLeft: 10,
	},
});
