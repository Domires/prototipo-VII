import React, { useState, useEffect, useMemo, useReducer } from 'react'
import AsyncStorage from '@react-native-community/async-storage'
import { ActivityIndicator, View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Login from './pages/Login'
import Home from './pages/Home'
import Opcoes from './pages/Opcoes'

import { AuthContext } from './contexts/AuthContext'

const Stack = createStackNavigator()

const App = () => {

    const [connected, setConnected] = useState(null)

    const [loginState, dispatch] = useReducer((prevState, action) => {
        switch (action.type) {
            case 'SIGN_IN':
                return {
                    ...prevState,
                    user: action.user,
                    isLoading: false
                }
            case 'SIGN_OUT':
                return {
                    ...prevState,
                    user: null,
                    isLoading: false
                }
        }
    }, {
        isLoading: true,
        user: null,
    })
    const options = {
        headerTitleAlign: 'center',
        headerStyle: {
            backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    }

    useEffect(() => {
        const bootstrapAsync = async () => {
            let rtsp, mqttBroker, user, password
            try {
                rtsp = await AsyncStorage.getItem('rtsp')
                mqttBroker = await AsyncStorage.getItem('mqttBroker')
                user = await AsyncStorage.getItem('user')
                password = await AsyncStorage.getItem('password')
                if (rtsp && mqttBroker && user && password) {
                    dispatch({ type: 'SIGN_IN', user: user })
                } else {
                    dispatch({ type: 'SIGN_OUT' })
                }
            } catch (err) {
                console.log('ERRO', err.message)
            }
        }
        bootstrapAsync()
    }, [])

    const authContext = useMemo(() => ({
        signIn: async (rtsp, mqttBroker, user, password) => {
            try {
                await AsyncStorage.multiSet([
                    ['rtsp', rtsp],
                    ['mqttBroker', mqttBroker],
                    ['user', user],
                    ['password', password]
                ])
                dispatch({ type: 'SIGN_IN', user: user })
            } catch (err) {
                console.log(err.message)
            }
        },
        signOut: async () => {
            try {
                await AsyncStorage.removeItem('rtsp')
                await AsyncStorage.removeItem('mqttBroker')
                await AsyncStorage.removeItem('user')
                await AsyncStorage.removeItem('password')

                dispatch({ type: 'SIGN_OUT' })
            } catch (err) {
                console.log(err.message)
            }
        }
    }), [])

    if (loginState.isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="black" />
            </View>
        )
    }

    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer >
                <Stack.Navigator initialRouteName="Login">
                    {loginState.user == null ?
                        (
                            <Stack.Screen name="Login" component={Login} options={{ title: 'AUTENTICAÇÃO', ...options }} />
                        ) : (
                            <>
                                <Stack.Screen name="Home" component={Home} options={{ title: 'DASHBOARD', ...options }} />
                                <Stack.Screen name="Opcoes" component={Opcoes} options={{ title: 'OPÇÕES', ...options }} />
                            </>
                        )
                    }
                </Stack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    )
}

export default App