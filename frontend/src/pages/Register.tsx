import React, { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonText, IonTitle, IonToolbar, useIonAlert, useIonRouter } from '@ionic/react';
import { arrowForwardCircleOutline, eyeOff, eye } from 'ionicons/icons';
import axios from 'axios';
import { set } from 'date-fns';

const apiURL = "https://api.finnhagan.co.uk/api";
// const apiURL = "http://127.0.0.1:8000/api";

const Register: React.FC = () => {
    const router = useIonRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [presentAlert] = useIonAlert();
    const [errorMessages, setErrorMessages] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
    });
    const [formKey, setFormKey] = useState(Date.now());

    const handleRegister = async (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirm_password = formData.get('confirm_password');

        setErrorMessages({ username: '', email: '', password: '', confirm_password: '' });

        if (password !== confirm_password) {
            setErrorMessages(errors => ({ ...errors, confirm_password: 'Passwords do not match. Please try again.' }));
            return;
        }

        const userData = {
            username,
            email,
            password,
            confirm_password,
        };

        try {
            await axios.post(`${apiURL}/register/`, userData, {
                headers: { 'Content-Type': 'application/json' },
            });
            // Redirect or show a success message
            presentAlert({
                header: 'Registration Successful',
                message: 'You have successfully registered. You can now log in.',
                buttons: [{
                    text: 'OK',
                    handler: () => {
                        setFormKey(Date.now());
                        router.push('/');
                    }
                }]
            });
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errors = error.response.data;
                Object.keys(errors).forEach(key => {
                    setErrorMessages(prevErrors => ({ ...prevErrors, [key]: errors[key].join(' ') }));
                });
            }
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
                        <form onSubmit={handleRegister} key={formKey}>
                            <IonInput labelPlacement="floating" label="Username" type="text" placeholder="Username" name='username' required></IonInput>
                            {errorMessages.username && <IonText color="danger"><sub>{errorMessages.username}</sub></IonText>}
                            <IonInput className='ion-margin-top' labelPlacement="floating" label="Email" type="email" name='email' placeholder="uod@dundee.ac.uk" required></IonInput>
                            {errorMessages.email && <IonText color="danger"><sub>{errorMessages.email}</sub></IonText>}
                            <IonInput className="ion-margin-top" labelPlacement="floating" label="Password" type={showPassword ? "text" : "password"} name='password' required></IonInput>
                            <IonIcon icon={showPassword ? eyeOff : eye} onClick={() => setShowPassword(!showPassword)} />
                            {errorMessages.password && <IonText color="danger"><sub>{errorMessages.password}</sub></IonText>}
                            <IonInput className="ion-margin-top" labelPlacement="floating" label="Confirm Password" type={showConfirmPassword ? "text" : "password"} name='confirm_password' required ></IonInput>
                            <IonIcon icon={showConfirmPassword ? eyeOff : eye} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                            {errorMessages.confirm_password && <IonText color="danger"><sub>{errorMessages.confirm_password}</sub></IonText>}
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