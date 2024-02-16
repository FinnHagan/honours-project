import React from 'react';
import { IonCard, IonCardContent, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router';

const Register: React.FC = () => {
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
                        REGISTER
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Register;