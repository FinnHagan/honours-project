import React, { useEffect, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonLoading, IonPage, IonText, IonTitle, IonToast, IonToolbar, useIonRouter } from '@ionic/react';
import { arrowForwardCircleOutline, personCircleOutline, reloadSharp, eye, eyeOff } from 'ionicons/icons';
import loginImage from '../assets/Login-screen-image.jpg';
import Introduction from '../components/Introduction';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';

const INTRO_VIEWED = 'intro-viewed';
const apiURL = "https://api.finnhagan.co.uk/api";
// const apiURL = "http://127.0.0.1:8000/api";

const Login: React.FC = () => {
    const router = useIonRouter();
    const [introViewed, setIntroViewed] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessages, setErrorMessages] = useState({
        username: '',
        password: '',
    });
    const [formKey, setFormKey] = useState(Date.now()); //Ensure form is reset after submission
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const checkStorage = async () => {
            const viewed = await Preferences.get({ key: INTRO_VIEWED });
            setIntroViewed(viewed.value === 'true');
        }
        checkStorage();
    }, []);

    const handleLogin = async (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password'),
        };

        setErrorMessages({ username: '', password: '' });

        setIsLoading(true);

        try {
            const response = await axios.post(`${apiURL}/login/`, loginData, {
                headers: { 'Content-Type': 'application/json' },
            });
            localStorage.setItem('token', response.data.key);
            setShowToast(true);
            setFormKey(Date.now());
            router.push('/submissionPage');
        } catch (error: any) {
            let errorMessage = "Login failed. Please check your credentials.";

            if (error.response && error.response.data) {
                if (error.response.data.non_field_errors) {
                    errorMessage = error.response.data.non_field_errors.join(' ');
                }

                //Display same error message for both fields so they don't know which one is wrong
                setErrorMessages({
                    username: errorMessage,
                    password: errorMessage,
                });
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const introDone = () => {
        console.log('Intro viewed');
        setIntroViewed(true);
        Preferences.set({ key: INTRO_VIEWED, value: 'true' });
    };

    const watchIntroAgain = () => {
        setIntroViewed(false);
        Preferences.set({ key: INTRO_VIEWED, value: 'false' });
    }

    return (
        <>
            {!introViewed ? (
                <Introduction onIntroViewed={introDone} />
            ) : (
                <IonPage>
                    <IonHeader>
                        <IonToolbar color='primary'>
                            <IonTitle>Should I Put My Washing On?</IonTitle>
                        </IonToolbar>
                    </IonHeader>

                    <IonContent>
                        <IonCard>
                            <IonCardContent>
                                <div>
                                    <img src={loginImage} alt="Login Page"></img>
                                </div>
                                <IonLoading isOpen={isLoading} message="Logging you in..." />
                                <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message="Successfully logged in!" color="success" duration={3000} />
                                <form onSubmit={handleLogin} key={formKey}>
                                    <IonInput labelPlacement="floating" label="Username" type="text" placeholder="Username" name='username' required></IonInput>
                                    {errorMessages.username && <IonText color="danger"><sub>{errorMessages.username}</sub></IonText>}
                                    <IonInput className="ion-margin-top" labelPlacement="floating" label="Password" type={showPassword ? "text" : "password"} name='password' required></IonInput>
                                    {errorMessages.password && <IonText color="danger"><sub>{errorMessages.password}</sub></IonText>}
                                    <IonIcon slot="end" icon={showPassword ? eyeOff : eye} onClick={() => setShowPassword(!showPassword)} />
                                    <IonButton className="ion-margin-top font-bold" expand="block" type="submit" shape="round">
                                        Login
                                        <IonIcon slot="end" icon={arrowForwardCircleOutline} />
                                    </IonButton>
                                    <IonButton className="ion-margin-top font-bold" routerLink="/register" expand="block" shape="round" color="success" >
                                        Create Account
                                        <IonIcon slot="end" icon={personCircleOutline} />
                                    </IonButton>
                                    <IonButton onClick={watchIntroAgain} className="ion-margin-top font-bold" expand="block" shape="round" color="danger" >
                                        Re-Watch Introduction
                                        <IonIcon slot="end" icon={reloadSharp} />
                                    </IonButton>
                                </form>
                            </IonCardContent>
                        </IonCard>
                    </IonContent>
                </IonPage>
            )}
        </>
    );
};

export default Login;