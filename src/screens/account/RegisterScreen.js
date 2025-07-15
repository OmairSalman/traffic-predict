import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUser } from '../../components/UserContext';
import { useToast } from 'expo-toast';

export default function RegisterScreen({ navigation, route })
{
  const { register } = useUser();
  const [location, setLocation] = useState(null);

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const [resgisterErrorMsg, setRegisterErrorMsg] = useState('');
  const [registerError, isRegisterError] = useState(false);

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

  const handleRegister = async () =>
  {
    try
    {
      setIsLoading(true);

      if (!name || !email || !password || !passwordConfirmation)
      {
        setRegisterErrorMsg('Please fill all fields!');
        isRegisterError(true);
        setIsLoading(false);
        return;
      }

      if (!emailRegex.test(email))
      {
        setRegisterErrorMsg('Email is incorrect!');
        isRegisterError(true);
        setIsLoading(false);
        return;
      }

      if(password.length < 8)
      {
        setRegisterErrorMsg('Password must be at least 8 characters!');
        isRegisterError(true);
        setIsLoading(false);
        return;
      }

      if (password !== passwordConfirmation)
      {
        setRegisterErrorMsg("Passwords don't match!");
        isRegisterError(true);
        setIsLoading(false);
        return;
      }

      await register(name, email, password);
      if(location)
        navigation.navigate('Final', { location: location });
      else
        navigation.navigate('MapScreen');

      toast.show('Registered successfully!',
        {
          type: 'success',
          duration: 3000,
          placement: 'bottom',
        }
      );

      setIsLoading(false);

      setName('');
      setEmail('');
      setPassword('');
      setPasswordConfirmation('');
    }
    catch (error)
    {
        if (!error.response)
        {
            console.log(error.message);
            if (error.message === 'Network Error')
            {
                await handleRegister();
            }
        }
      else
      {
        const errorData = error.response.data;
        let logMessage = '';

        switch(errorData.message)
        {
          case 'The email address is already in use.':
          {
            setRegisterErrorMsg('The email address is already taken');
            logMessage = 'Email is already taken';
            break;
          }
        }

        switch(error.status)
        {
          case 400:
          {
            setRegisterErrorMsg('Unable to connect to the server. Please check your network or try again later. Sorry for the inconvenience!');
            logMessage = 'Server connection issue (400 Bad Request)';
            break;
          }

          case 404:
          {
            setRegisterErrorMsg('The server is currently offline. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Server endpoint not found/unreachable (404)';
            break;
          }

          case 409:
          {
            setRegisterErrorMsg('Email is already in use!');
            logMessage = 'Email is already in use';
            break;
          }

          case 422:
          {
            setRegisterErrorMsg('Validation failed');
            logMessage = 'Validation failed';
            break;
          }

          case 429:
          {
            setRegisterErrorMsg('Too many attempts. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Rate limited';
            break;
          }

          case 500:
          {
            setRegisterErrorMsg('Something went wrong on the server. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Internal server error';
            break;
          }
          
          case 503:
          {
            setRegisterErrorMsg('The service is temporarily unavailable. Please try again later. Sorry for the inconvenience!');
            logMessage = 'Service unavailable';
            break;
          }
        }

        if(logMessage === '')
        {
          setRegisterErrorMsg('An unexpected error occurred. Please try again later. Sorry for the inconvenience!');
          logMessage = 'An unexpected error occurred';
        }
        
        isRegisterError(true);
        const errorDate = new Date();
        const errorDateString = errorDate.toLocaleDateString();
        const errorTimeString = errorDate.toLocaleTimeString();
        console.log(`[${errorDateString} @ ${errorTimeString}] Unsuccessful registration attempt, reason: ${logMessage}.\nAPI response data:`, errorData,
        '\nAPI error:', error);
        setIsLoading(false);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back-outline" size={24} color="#0f0835" />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.header}>Sign up</Text>
        <Text style={styles.subheader}>Create an account to sync your routes accross devices!</Text>
      </View>
      {registerError && <Text style={styles.erroLabel}>{resgisterErrorMsg}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={(text) => {setName(text); isRegisterError(false);}}
        />
        <View style={styles.underline} />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={(text) => {setEmail(text); isRegisterError(false);}}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.underline} />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            autoCapitalize="none"
            secureTextEntry={!showPassword} // Dynamically toggle visibility
            style={[styles.input, { flex: 1 }]} // Flex to make input share space with the icon
            value={password}
            onChangeText={(text) => { setPassword(text); isRegisterError(false); }}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} // Eye icon toggle
              size={24}
              color="#ccc"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.underline} />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm password"
            autoCapitalize="none"
            secureTextEntry={!showPasswordConfirmation} // Dynamically toggle visibility
            style={[styles.input, { flex: 1 }]} // Flex to make input share space with the icon
            value={passwordConfirmation}
            onChangeText={(text) => { setPasswordConfirmation(text); isRegisterError(false); }}
          />
          <TouchableOpacity onPress={() => setShowPasswordConfirmation((prev) => !prev)}>
            <Icon
              name={showPasswordConfirmation ? 'eye-off-outline' : 'eye-outline'} // Eye icon toggle
              size={24}
              color="#ccc"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.underline} />
      </View>
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleRegister}
        disabled={isLoading}
      >
      {isLoading ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.signUpButtonText}>SIGN UP</Text>)}
      </TouchableOpacity>
      <View style={styles.loginContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen', { location: location })}>
          <Text style={styles.loginText}>{"Already have an account?"} <Text style={styles.loginLink}>Login</Text></Text>
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
    marginBottom: 20,
    marginTop: 30,
  },
  header:
  {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    //color: '#451E5D',
  },
  subheader:
  {
    fontSize: 20,
    color: '#9491c7',
    marginBottom: 20,
  },
  inputContainer:
  {
    width: '100%',
    marginBottom: 20,
  },
  input:
  {
    fontSize: 16,
    color: '#05017b',
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
    alignSelf: 'center',
    marginBottom: 10,
  },
  signUpButton:
  {
    backgroundColor: 'blue',
    width: '100%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  signUpButtonText:
  {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer:
  {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  loginText:
  {
    fontSize: 14,
    color: '#9491c7',
  },
  loginLink:
  {
    color: '#4A00E0',
    fontWeight: 'bold',
  },
});