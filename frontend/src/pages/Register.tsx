import React, { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import { arrowForwardCircleOutline, eyeOff, eye } from 'ionicons/icons';
import axios from 'axios';

const apiURL = "https://api.finnhagan.co.uk/api";
// const apiURL = "http://127.0.0.1:8000/api";

const Register: React.FC = () => {
    const router = useIonRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [presentAlert] = useIonAlert();

    const handleRegister = async (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirm_password = formData.get('confirm_password');

        if (password !== confirm_password) {
            presentAlert({
                header: 'Password Mismatch',
                message: 'Passwords do not match. Please try again.',
                buttons: ['OK']
            });
            return;
        }

        const userData = {
            username,
            email,
            password,
            confirm_password,
        };

        try {
            const response = await axios.post(`${apiURL}/register/`, JSON.stringify(userData), {
                headers: { 'Content-Type': 'application/json' },
            });
            router.push('/');
        } catch (error: any) {
            console.error('Error registering user:', error.response?.data || error.message);
            presentAlert({
                header: 'Registration Failed',
                message: 'Failed to register user. Please try again.',
                buttons: ['OK']
            });
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonTitle>Register</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonCard>
                    <IonCardContent>
                        <form onSubmit={handleRegister}>
                            <IonInput fill="outline" labelPlacement="floating" label="Username" type="text" placeholder="Username" name='username' required></IonInput>
                            <IonInput className='ion-margin-top' fill="outline" labelPlacement="floating" label="Email" type="email" name='email' placeholder="uod@dundee.ac.uk" required></IonInput>
                            <IonInput className="ion-margin-top" fill="outline" labelPlacement="floating" label="Password" type={showPassword ? "text" : "password"} name='password' required></IonInput>
                            <IonIcon icon={showPassword ? eyeOff : eye} onClick={() => setShowPassword(!showPassword)} />
                            <IonInput className="ion-margin-top" fill="outline" labelPlacement="floating" label="Confirm Password" type={showConfirmPassword ? "text" : "password"} name='confirm_password' required ></IonInput>
                            <IonIcon icon={showConfirmPassword ? eyeOff : eye} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
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