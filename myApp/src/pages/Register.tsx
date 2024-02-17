import React from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { arrowForwardCircleOutline } from 'ionicons/icons';

const Register: React.FC = () => {
    const router = useIonRouter();

    const handleRegister = (event: any) => {
        event.preventDefault();
        console.log('Registered');
        router.goBack();
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonTitle>Should I Put My Washing On?</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent scrollY={false}>
                <IonCard>
                    <IonCardContent>
                        <form onSubmit={handleRegister}>
                            <IonInput fill="outline" labelPlacement="floating" label="Email" type="email" placeholder="uod@dundee.ac.uk" required></IonInput>
                            <IonInput className="ion-margin-top" fill="outline" labelPlacement="floating" label="Password" type="password" required></IonInput>
                            <IonButton className="ion-margin-top font-bold" expand="block" type="submit" shape="round" color="success">
                                Create Account
                                <IonIcon slot="end" icon={arrowForwardCircleOutline} />
                            </IonButton>
                        </form>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Register;