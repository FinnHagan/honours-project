import React, { useEffect, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { arrowForwardCircleOutline, personCircleOutline, reloadSharp } from 'ionicons/icons';
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

        try {
            const response = await axios.post(`${apiURL}/login/`, JSON.stringify(loginData), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Login successful:', response.data);
            // Store the token and redirect
            localStorage.setItem('token', response.data.key); // Adjust depending on token response
            router.push('/submissionPage');
        } catch (error: any) {
            console.error('Error logging in:', error.response.data);
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
                                <form onSubmit={handleLogin}>
                                    <IonInput fill="outline" labelPlacement="floating" label="Username" type="text" placeholder="Username" name='username' required></IonInput>
                                    <IonInput className="ion-margin-top" fill="outline" labelPlacement="floating" label="Password" type="password" name='password' required></IonInput>
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