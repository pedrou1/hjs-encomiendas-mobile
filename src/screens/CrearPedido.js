import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Layout, Text, TextInput, Button, themeColor, TopNav } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Chip, Text as TextPaper } from 'react-native-paper';
import * as pedidos from '../services/pedidos';
import * as Constantes from '../utils/Constantes';

export default function ({ route, navigation }) {
	const { user, setUser } = useContext(AuthContext);
	//const [chofer, setChofer] = useState({});
	const [direccion, setDireccion] = useState(null);
	const [cliente, setCliente] = useState({});
	const [tipoPedido, setTipoPedido] = useState({});
	const [estado, setEstado] = useState(estados[0]);
	const [tarifa, setTarifa] = useState(0);
	const [errors, setErrors] = useState({});

	const params = route.params;

	// //({ route, navigation })
	// //const { usuario, unidad } = route.params;

	useEffect(() => {
		//setChofer(params.chofer);
		if (params?.clienteSeleccionado) setCliente(params.clienteSeleccionado);
		if (params?.tipoPedidoSeleccionado) setTipoPedido(params.tipoPedidoSeleccionado);
		if (params?.tipoPedidoSeleccionado?.tarifa) setTarifa(params.tipoPedidoSeleccionado?.tarifa.toString());
		if (params?.direccionSeleccionada) setDireccion(params.direccionSeleccionada);

		setErrors({
			cliente: false,
			tipoPedido: false,
		});
	}, [params]);

	const formSchema = yup.object({});

	return (
		<KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
			<Layout>
				<TopNav
					middleContent="Crear pedido"
					leftContent={<Ionicons name="chevron-back" size={20} color={themeColor.black} />}
					leftAction={() => navigation.goBack()}
				/>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
					}}
				>
					<Formik
						initialValues={{}}
						validationSchema={formSchema}
						onSubmit={async (values, e) => {
							try {
								setErrors({
									cliente: !cliente.idCliente ? true : false,
									tipoPedido: !tipoPedido.idTipoPedido ? true : false,
								});

								if (direccion && tipoPedido && cliente && tarifa) {
									const pedidoIngresado = {
										idChofer: user.idUsuario,
										idCliente: cliente.idCliente,
										cliente: cliente,
										tarifa: tarifa,
										idTipoPedido: tipoPedido.idTipoPedido,
										longitude: direccion.longitude,
										latitude: direccion.latitude,
										nombreDireccion: direccion.nombreDireccion,
										key: direccion.nombreDireccion,
										nombreCliente: cliente.nombre,
									};

									const pedidoIngresadoParsedServidor = {
										idChofer: user.idUsuario,
										idCliente: cliente.idCliente,
										tarifa: parseInt(tarifa),
										idTipoPedido: tipoPedido.idTipoPedido,
										longitude: direccion.longitude,
										latitude: direccion.latitude,
										nombreDireccion: direccion.nombreDireccion,
										idTransporte: user.unidad.idUnidadTransporte,
										estado: Constantes.ESTADO_PEDIDO_PENDIENTE,
									};

									const res = await pedidos.registrarPedido(pedidoIngresadoParsedServidor);

									if (res.operationResult == Constantes.SUCCESS) {
										navigation.navigate('Inicio', { pedidoIngresado: true });
										// , {
										// 	pedidoIngresado,
										// }
									} else if (res.operationResult == Constantes.ERROR) {
										Alert.alert('Error', 'Ha ocurrido un error al crear el pedido');
									}

									// const res = pedido
									// 	? await servicioPedidos.modificarPedido(pedidoIngresado)
									// 	: await servicioPedidos.registrarPedido(pedidoIngresado);
								} else {
									// Alert.alert('Error', 'Ingrese los datos');
								}
							} catch (error) {
								console.log(error);
							}
						}}
					>
						{(props) => (
							<>
								<View
									style={{
										flex: 3,
										paddingTop: 20,
										paddingHorizontal: 20,
										paddingBottom: 20,
										backgroundColor: themeColor.white,
									}}
								>
									<Text>Direccion</Text>
									<TouchableOpacity
										onPress={() => {
											navigation.navigate('SeleccionarDireccion');
										}}
									>
										<Chip
											icon={() => <Icon name={direccion ? 'check-bold' : 'information'} size={16} color="black" />}
											style={{ padding: 10, marginTop: 2, backgroundColor: '#c9daff' }}
										>
											<TextPaper variant="titleMedium">
												{direccion ? direccion.nombreDireccion : 'Haz click para selecionar una direccion'}
											</TextPaper>
										</Chip>
									</TouchableOpacity>

									<Text style={{ marginTop: 15 }}>Cliente</Text>
									<TouchableOpacity
										onPress={() => {
											navigation.navigate('Clientes');
										}}
									>
										<Chip
											style={{ padding: 10, marginTop: 2, backgroundColor: '#c9daff' }}
											icon={() => <Icon name={cliente?.nombre ? 'check-bold' : 'information'} size={17} color="black" />}
										>
											<TextPaper variant="titleMedium">
												{cliente?.nombre ? cliente.nombre : 'Haz click para selecionar un usuario'}
											</TextPaper>
										</Chip>
									</TouchableOpacity>

									<Text size="sm" style={styles.error}>
										{errors.cliente && 'Ingrese un cliente'}
									</Text>

									<Text>Tipo</Text>
									<TouchableOpacity
										onPress={() => {
											navigation.navigate('TiposPedidos');
										}}
									>
										<Chip
											style={{ padding: 10, marginTop: 2, backgroundColor: '#c9daff' }}
											icon={() => <Icon name={tipoPedido?.nombre ? 'check-bold' : 'information'} size={17} color="black" />}
										>
											<TextPaper variant="titleMedium">
												{tipoPedido?.nombre ? tipoPedido.nombre : 'Haz click para selecionar un tipo'}
											</TextPaper>
										</Chip>
										{/* <View
												style={{
													flexDirection: 'row',
													backgroundColor: '#f6f6f6',
													borderRadius: 10,
													padding: 5,
													alignItems: 'center',
													width: '100%',
												}}
											> */}
									</TouchableOpacity>
									{tipoPedido.pesoDesde && (
										<>
											<Text style={{ marginTop: 2 }}>
												<Text variant="titleSmall">{'Tarifa: '}</Text>
												<Text
													style={{
														backgroundColor: '#f6f6f6',
														borderRadius: 15,
														padding: 5,
														alignItems: 'center',
														width: '50%',
													}}
													variant="titleMedium"
												>
													{'$ ' + tipoPedido.tarifa}
												</Text>
											</Text>
											<Text>
												<Text variant="titleMedium">{'Peso desde: '}</Text>
												<Text
													style={{
														backgroundColor: '#f6f6f6',
														borderRadius: 10,
														padding: 5,
														alignItems: 'center',
														width: '50%',
													}}
													variant="titleMedium"
												>
													{tipoPedido.pesoDesde + ' km'}
												</Text>

												<Text variant="titleMedium">{'  Peso hasta: '}</Text>
												<Text
													style={{
														backgroundColor: '#f6f6f6',
														borderRadius: 10,
														padding: 5,
														alignItems: 'center',
														width: '50%',
													}}
													variant="titleMedium"
												>
													{tipoPedido.pesoHasta + ' km'}
												</Text>
											</Text>
										</>
									)}
									<Text size="sm" style={styles.error}>
										{errors.tipoPedido && 'Ingrese un tipo de pedido'}
									</Text>

									<Text style={{ marginTop: 15 }}>Tarifa</Text>
									<TextInput
										containerStyle={{ marginTop: 15 }}
										placeholder="Introduce tu tarifa"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										keyboardType="numeric"
										onChangeText={(t) => setTarifa(t)}
										value={tarifa}
									/>
									{/* <Text>Tamaño</Text>
									<TextInput
										containerStyle={{ marginTop: 15 }}
										placeholder="Introduce tu tamaño"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										onChangeText={props.handleChange('tamaño')}
										value={props.values.tamaño}
										onBlur={props.handleBlur('tamaño')}
									/>
									<Text size="sm" style={styles.error}>
										{props.touched.tamaño && props.errors.tamaño}
									</Text>

									<Text>Peso</Text>
									<TextInput
										containerStyle={{ marginTop: 15 }}
										placeholder="Introduce tu peso"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										onChangeText={props.handleChange('peso')}
										value={props.values.peso}
										onBlur={props.handleBlur('peso')}
									/>
									<Text size="sm" style={styles.error}>
										{props.touched.peso && props.errors.peso}
									</Text> */}
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Button
											text={'Crear pedido'}
											onPress={props.handleSubmit}
											style={{
												marginTop: 10,
											}}
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

const estados = [
	{ label: 'Pendiente', value: 1 },
	{ label: 'En Curso', value: 2 },
	{ label: 'Finalizado', value: 3 },
];
