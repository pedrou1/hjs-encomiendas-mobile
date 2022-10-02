import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Image, StyleSheet, TouchableOpacity } from 'react-native';
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

	const params = route.params;

	// //({ route, navigation })
	// //const { usuario, unidad } = route.params;

	useEffect(() => {
		//setChofer(params.chofer);
		if (params?.clienteSeleccionado) setCliente(params.clienteSeleccionado);
		if (params?.tipoPedidoSeleccionado) setTipoPedido(params.tipoPedidoSeleccionado);
		if (params?.tipoPedidoSeleccionado?.tarifa) setTarifa(params.tipoPedidoSeleccionado?.tarifa.toString());
		if (params?.direccionSeleccionada) setDireccion(params.direccionSeleccionada);
	}, [params]);

	const formSchema = yup.object({
		tamaño: 0,
		peso: 0,
		cubicaje: 0,
	});

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
						initialValues={{
							tamaño: 0,
							peso: 0,
							cubicaje: 0,
						}}
						validationSchema={formSchema}
						onSubmit={async (values, e) => {
							try {
								if (direccion && tipoPedido && cliente && tarifa) {
									const pedidoIngresado = {
										...values,
										idChofer: cliente.idCliente,
										idCliente: cliente.idCliente,
										tarifa: tarifa,
										idTipoPedido: tipoPedido.idTipoPedido,
										longitude: direccion.longitude,
										latitude: direccion.latitude,
										nombreDireccion: direccion.nombreDireccion,
										key: direccion.nombreDireccion,
										nombreCliente: cliente.nombre,
									};

									const pedidoIngresadoParsedServidor = {
										...values,
										idChofer: cliente.idCliente,
										idCliente: cliente.idCliente,
										tarifa: parseInt(tarifa),
										idTipoPedido: tipoPedido.idTipoPedido,
										longitude: direccion.longitude,
										latitude: direccion.latitude,
										nombreDireccion: direccion.nombreDireccion,
										idTransporte: 2,
									};

									const res = await pedidos.registrarPedido(pedidoIngresadoParsedServidor);
									console.log(res);
									if (res.operationResult == Constantes.SUCCESS) {
										navigation.navigate('Inicio', {
											pedidoIngresado,
										});
									} else if (res.operationResult == Constantes.ERROR) {
										//FIXME MENSAJE ERROR
									}

									// const res = pedido
									// 	? await servicioPedidos.modificarPedido(pedidoIngresado)
									// 	: await servicioPedidos.registrarPedido(pedidoIngresado);
								} else {
									// toast.error('Ingrese los datos');
								}
							} catch (error) {}
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

									<Text>Usuario</Text>
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
										{props.touched.usuario && props.errors.usuario}
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
									</TouchableOpacity>

									<Text>Tarifa</Text>
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
									<Text>Tamaño</Text>
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
									</Text>

									<Text>Cubicaje</Text>
									<TextInput
										containerStyle={{ marginTop: 15 }}
										placeholder="Introduce tu cubicaje"
										autoCapitalize="none"
										autoCompleteType="off"
										autoCorrect={false}
										onChangeText={props.handleChange('cubicaje')}
										value={props.values.cubicaje}
										onBlur={props.handleBlur('cubicaje')}
									/>
									<Text size="sm" style={styles.error}>
										{props.touched.cubicaje && props.errors.cubicaje}
									</Text>
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
