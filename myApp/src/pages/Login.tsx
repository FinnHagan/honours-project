import React from 'react';
import { IonButton, IonCard, IonCardContent, IonContent, IonFooter, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Login: React.FC = () => {
    const handleLogin = (event: any) => {
        event.preventDefault();
        console.log('Login');
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='primary'>
                    <IonTitle>Should I Put My Washing On?</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonCard>
                    <IonCardContent>
                        <form onSubmit={handleLogin}>
                            <IonInput fill="outline" labelPlacement="floating" label="Email" type="email" placeholder="uod@dundee.ac.uk" required></IonInput>
                            <IonInput className="ion-margin-top" fill="outline" labelPlacement="floating" label="Password" type="password" required></IonInput>
                            <IonButton className="ion-margin-top" expand="block" type="submit" shape="round">Login</IonButton>
                            <IonButton className="ion-margin-top" routerLink="/register" expand="block" shape="round" color="tertiary" >Create Account</IonButton>
                        </form>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Login;