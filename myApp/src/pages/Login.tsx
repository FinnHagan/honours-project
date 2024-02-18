import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { arrowForwardCircleOutline, personCircleOutline } from 'ionicons/icons';
import loginImage from '../assets/Login-screen-image.jpg';
import Introduction from '../components/Introduction';

const Login: React.FC = () => {
    const router = useIonRouter();
    const [introViewed, setIntroViewed] = useState(false);

    const handleLogin = (event: any) => {
        event.preventDefault();
        console.log('Login');

        // router.push('/home', 'root');
    };

    const introDone = () => {
        console.log('Intro viewed');
        setIntroViewed(true);
    };

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
                                    <IonInput fill="outline" labelPlacement="floating" label="Email" type="email" placeholder="uod@dundee.ac.uk" required></IonInput>
                                    <IonInput className="ion-margin-top" fill="outline" labelPlacement="floating" label="Password" type="password" required></IonInput>
                                    <IonButton className="ion-margin-top font-bold" expand="block" type="submit" shape="round">
                                        Login
                                        <IonIcon slot="end" icon={arrowForwardCircleOutline} />
                                    </IonButton>
                                    <IonButton className="ion-margin-top font-bold" routerLink="/register" expand="block" shape="round" color="success" >
                                        Create Account
                                        <IonIcon slot="end" icon={personCircleOutline} />
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