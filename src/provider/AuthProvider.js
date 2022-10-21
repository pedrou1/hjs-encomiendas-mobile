import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const AuthProvider = (props) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		checkLogin();
	}, []);

	async function checkLogin() {
		const token = await AsyncStorage.getItem('token');
		const usuario = await AsyncStorage.getItem('usuario');
		if (usuario) setUser(JSON.parse(usuario));
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
