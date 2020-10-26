import React, { useState, useReducer, useCallback, useEffect } from 'react'

import { View, StyleSheet, ScrollView, Button, ActivityIndicator, Alert, Image } from 'react-native'


import Input from '../Components/Input'
import Card from '../Components/Card'
import Colors from '../constants/Colors'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch } from 'react-redux';
import * as authActions from '../store/actions/auth'
import { GoogleSignin } from '@react-native-community/google-signin';

import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
    webClientId: '290457827807-r33ihle2372rcu81q6t2jg5h0qt2kq26.apps.googleusercontent.com',
});

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
    if (action.type === FORM_INPUT_UPDATE) {
        const updatedValues = {
            ...state.inputValues,
            [action.input]: action.value
        };
        const updatedValidities = {
            ...state.inputValidities,
            [action.input]: action.isValid
        };
        let updatedFormIsValid = true;
        for (const key in updatedValidities) {
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
        }
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
};

const onGoogleButtonPress = async () => {
    // Get the users ID token
    let action;
    try {
        const { idToken, accessToken } = await GoogleSignin.signIn();

        console.log(idToken);
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
    } catch (e) {
        console.log(e)
    }

}



const Login = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState();

    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            email: '',
            password: ''
        },
        inputValidities: {
            email: false,
            password: false
        },
        formIsValid: false
    });

    useEffect(() => {
        if (error) {
            Alert.alert('An error Ocurred!', error.message, [{ text: 'Okay' }])
        }

    }, [error]);




    const authHandler = async () => {
        let action;
        if (isSignup) {
            action = authActions.signup(formState.inputValues.email, formState.inputValues.password);

        }
        else {
            action = authActions.login(formState.inputValues.email, formState.inputValues.password);
        }

        setError(null);
        setIsLoading(true);
        try {
            await dispatch(action);
            props.navigation.navigate('UserHome')
        } catch (err) {
            setError(err)

            setIsLoading(false);
        }

    }

    const inputChangeHandler = useCallback(
        (inputIdentifier, inputValue, inputValidity) => {
            dispatchFormState({
                type: FORM_INPUT_UPDATE,
                value: inputValue,
                isValid: inputValidity,
                input: inputIdentifier
            });
        },
        [dispatchFormState]
    );

    return (
        <View
            style={styles.screen}>


            <LinearGradient colors={['#F97562', '#F9EFB5']} style={styles.gradient}>
                <Card style={styles.authContainer}>
                    <Image source={require('../assets/images/login.png')} style={{ width: 40, height: 40, alignSelf: 'center', resizeMode: 'contain', marginTop: 7 }} />

                    <ScrollView>
                        <Input
                            id='email'
                            label='E-Mail'
                            keyboardType='email-address'
                            required
                            email
                            autoCapitalize='none'
                            errorText='Please enter a valid email address.'
                            onInputChange={inputChangeHandler}
                            initialValue="" />

                        <Input
                            id='password'
                            label='Password'
                            keyboardType="default"
                            secureTextEntry
                            minLength={5}
                            required

                            autoCapitalize='none'
                            errorText='Please enter a valid password.'
                            onInputChange={inputChangeHandler}
                            initialValue="" />
                        <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={Colors.primaryColor} />
                            ) : (
                                    <Button
                                        title={isSignup ? 'Sign Up' : 'Login'}
                                        color={Colors.primaryColor}
                                        onPress={authHandler}
                                    />
                                )}
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button title={`Switch to ${isSignup ? 'Login' : 'Sign Up'} `}
                                color={'#F4BE22'} onPress={() => {
                                    setIsSignup(prevState => !prevState)
                                }} />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Google Sign In"
                                onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
                            />

                        </View>
                    </ScrollView>
                </Card>
            </LinearGradient>
        </View>

    )
};

Login.navigationOptions = {
    headerShown: false
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authContainer: {
        width: '80%',
        maxWidth: 400,
        padding: 20,
        maxHeight: 400,
    },
    buttonContainer: {
        marginTop: 10
    }

});

export default Login;
