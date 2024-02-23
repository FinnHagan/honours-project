import React, { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, IonText, IonDatetime } from '@ionic/react';
import axios from 'axios';

const LandingPage: React.FC = () => {
    const [postCode, setPostCode] = useState('');
    const [solarPanels, setSolarPanels] = useState<number>(1); // Assuming a default of 1 solar panel
    const [isValid, setIsValid] = useState(true);

    const postCodeRegex = /([A-Z]{1,2}[0-9]{1,2})([A-Z]{1,2})?(\W)?([0-9]{1,2}[A-Z]{2})?/i; // A simple regex to match UK post codes

    const handleSubmit = (event: any) => {
        event.preventDefault();

        if (!isValid) {
            console.error('Invalid post code.');
            return;
        }

        const data = {
            postCode,
            solarPanels,
            // Add other fields as necessary
        };

        axios.post('`${process.env.REACT_APP_API_URL}/`', {
            post_code: postCode,
            number_of_solar_panels: solarPanels,
        })
            .then(response => {
                console.log('Success:', response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handlePostCodeChange = (e: CustomEvent) => {
        const value = e.detail.value as string;
        if (postCodeRegex.test(value) || value === '') {
            setIsValid(true);
        } else {
            setIsValid(false);
        }
        setPostCode(value);
    };

    const handleSolarPanelsChange = (e: CustomEvent) => {
        const value = parseInt(e.detail.value, 10);
        setSolarPanels(!isNaN(value) && value > 0 ? value : 1);
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
                        <form onSubmit={handleSubmit}>
                            <IonInput label="Number of Solar Panels" labelPlacement="floating" type="number" value={solarPanels.toString()} onIonChange={handleSolarPanelsChange} min="1" step="1" />
                            <IonInput label="Post Code" labelPlacement="floating" value={postCode} onIonChange={handlePostCodeChange} />
                            {/* <IonInput label="Date" labelPlacement="floating" type="date" placeholder="Date" required></IonInput> */}
                            <IonButton className="ion-margin-top" expand="block" type="submit" shape="round" color="success">
                                Submit
                            </IonButton>
                            {!isValid && <IonText color="danger">Please enter a valid post code.</IonText>}
                        </form>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default LandingPage;