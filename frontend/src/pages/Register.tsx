import React from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { arrowForwardCircleOutline } from 'ionicons/icons';
import axios from 'axios';

const apiURL = "https://api.finnhagan.co.uk/api";
// const apiURL = "http://127.0.0.1:8000/api";

const Register: React.FC = () => {
    const router = useIonRouter();

    const handleRegister = async (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = {
            username: formData.get('username'), // Ensure the 'name' attributes in your form match these keys
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            const response = await axios.post(`${apiURL}/register/`, JSON.stringify(userData), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('User registered:', response.data);
            // Redirect or handle response
            router.push('/');
        } catch (error: any) {
            console.error('Error registering user:', error.response.data);
        }
    };

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

            <IonContent>
                <IonCard>
                    <IonCardContent>
                        <form onSubmit={handleRegister}>
                            <IonInput fill="outline" labelPlacement="floating" label="Username" type="text" placeholder="Username" name='username' required></IonInput>
                            <IonInput className='ion-margin-top' fill="outline" labelPlacement="floating" label="Email" type="email" name='email' placeholder="uod@dundee.ac.uk" required></IonInput>
                            <IonInput className="ion-margin-top" fill="outline" labelPlacement="floating" label="Password" type="password" name='password' required></IonInput>
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