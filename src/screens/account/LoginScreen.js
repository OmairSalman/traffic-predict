import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUser } from '../../components/UserContext';
import { useToast } from 'expo-toast';

export default function LoginScreen({ navigation, route })
{
    const { login } = useUser();
    const [location, setLocation] = useState(null);
  
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loginErrorMsg, setLoginErrorMsg] = useState('');
  const [loginError, isLoginError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const toast = useToast();

  useEffect(() =>
    {
      const location = route.params?.location;
      if (location)
      {
        setLocation(location);
      }
    }, [route.params?.location]);

  const handleLogin = async () =>
  {
    setIsLoading(true);
    try
    {
      if (!email || !password)
      {
        setLoginErrorMsg('Please enter your credentials!');
        isLoginError(true);
        setIsLoading(false);
        return;
      }
      if (!emailRegex.test(email))
      {
        setLoginErrorMsg('Email is incorrect!');
        isLoginError(true);
        setIsLoading(false);
        return;
      }


      await login(email, password);
      if(location)
        navigation.navigate('Final', { location: location });
      else
        navigation.navigate('ProfileScreen');

      toast.show('Logged in successfully!',
        {
          type: 'success',
          duration: 3000,
          placement: 'bottom',
        }
      );

      setIsLoading(false);

      setEmail('');
      setPassword('');
    }
    catch (error)
    {
      if (!error.response)
      {
        if (error.message === 'Network Error')
        {
          await handleLogin();
        }
      }
      else
      {
        const errorData = error.response.data;
        let logMessage = '';
        switch(error.status)
        {
          case 400:
          {
            setLoginErrorMsg('Unable to connect to the server. Please check your network or try again later. Sorry for the inconvenience!');
            logMessage = 'Server connection issue (400 Bad Request)';
            break;
          }
          case 401:
          {
            setLoginErrorMsg('Invalid credentials!');
            logMessage = 'Invalid credentials';
            break;
          }
          case 404:
          {
            setLoginErrorMsg('The server is currently offline. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Server endpoint not found/unreachable (404)';
            break;
          }
          case 429:
          {
            setLoginErrorMsg('Too many attempts. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Rate limited';
            break;
          }
          case 500:
          {
            setLoginErrorMsg('Something went wrong on the server. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Internal server error';
            break;
          }
          case 503:
          {
            setLoginErrorMsg('The service is temporarily unavailable. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Service unavailable';
            break;
          }
          default:
          {
            setLoginErrorMsg('An unexpected error occurred. Please try again later. Sorry for the inconvenience!');
            logMessage = `Unhandled error status: ${error.status}`;
          }
        }
        isLoginError(true);
        const errorDate = new Date();
        const errorDateString = errorDate.toLocaleDateString();
        const errorTimeString = errorDate.toLocaleTimeString();
        console.log(`[${errorDateString} @ ${errorTimeString}] Unsuccessful login attempt, reason: ${logMessage}.\nAPI response data:`, errorData,
        '\nAPI error: "', error);
        setIsLoading(false);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back-outline" size={30} color="#0f0835" />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.header}>Login to sync your routes</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={(text) => {setEmail(text); isLoginError(false);}}
        />
        <View style={styles.underline} />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={(text) => { setPassword(text); isLoginError(false); }}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#ccc"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.underline} />
        {loginError && <Text style={styles.erroLabel}>{loginErrorMsg}</Text>}
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.loginButtonText}>LOGIN</Text>)}
      </TouchableOpacity>
      <View style={styles.forgotPasswordContainer}>
        <TouchableOpacity onPress={() => alert('Feature coming soon!')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.signUpContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen', { location: location })}>
          <Text style={styles.signUpText}>{"Don't have an account?"} <Text style={styles.signUpLink}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  backButton:
  {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  textContainer:
  {
    alignItems: 'left',
    marginBottom: 60,
    marginTop: 30,
  },
  header:
  {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    //color: '#451E5D',
  },
  inputContainer:
  {
    width: '100%',
    marginBottom: 20,
    textAlignVertical: 'center',
  },
  input:
  {
    fontSize: 16,
    //color: '#05017b',
    paddingVertical: 8,
  },
  underline:
  {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  passwordContainer:
  {
    flexDirection: 'row',
    alignItems: 'center',
  },
  erroLabel:
  {
    fontSize: 16,
    color:'red',
    alignSelf: 'center'
  },
  loginButton:
  {
    backgroundColor: 'blue',
    width: '100%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  loginButtonText:
  {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordContainer:
  {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPassword:
  {
    color: '#4A00E0',
    fontSize: 16,
  },
  signUpText:
  {
    fontSize: 14,
    color: '#9491c7',
  },
  signUpLink:
  {
    color: '#4A00E0',
    fontWeight: 'bold',
  },
  signUpContainer:
  {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  }
});