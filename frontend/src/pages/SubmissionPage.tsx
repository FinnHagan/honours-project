import React, { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar, IonText, IonDatetime } from '@ionic/react';
import axios from 'axios';

const SubmissionPage: React.FC = () => {
    const [post_code, setPostCode] = useState('');
    const [solar_panels, setSolarPanels] = useState<number>(1);
    const [date, setDate] = useState<string>('');
    const [isValid, setIsValid] = useState(true);

    const postCodeRegex = /([A-Z]{1,2}[0-9]{1,2})([A-Z]{1,2})?(\W)?([0-9]{1,2}[A-Z]{2})?/i; // A simple regex to match UK post codes

    const viteUrl = import.meta.env.VITE_APP_API_URL;
    const reactUrl = process.env.REACT_APP_API_URL;

    const handleSubmit = (event: any) => {
        event.preventDefault();

        const data = {
            post_code: post_code,
            number_of_solar_panels: solar_panels,
            date: date
        };

        console.log("Vite Api URL:", viteUrl);
        console.log("React Api URL:", reactUrl);

        axios.post(`https://api.finnhagan.co.uk/api/submission/`, data)
            .then(response => {
                console.log('Success:', response.data);
                console.log('Full Axios Response:', response);
            })
            .catch(error => {
                console.error('Error:', error);
                console.error('Error Response:', error.response);
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

    const handleDateChange = (e: CustomEvent) => {
        const value = e.detail.value as string;
        setDate(value);
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
                            <IonInput fill="outline" label="Number of Solar Panels" required labelPlacement="floating" type="number" value={solar_panels.toString()} onIonChange={handleSolarPanelsChange} min="1" step="1" />
                            <IonInput className="ion-margin-top" fill="outline" label="Post Code" labelPlacement="floating" required value={post_code} onIonChange={handlePostCodeChange} />
                            <IonInput className="ion-margin-top" fill="outline" label="Date" labelPlacement="floating" required type="date" placeholder="Date" value={date} onIonChange={handleDateChange}></IonInput>
                            <IonButton className="ion-margin-top" expand="block" type="submit" shape="round" color="success">
                                Submit
                            </IonButton>
                            {!isValid && <IonText color="danger">Please enter a valid post code.</IonText>} {/*Update this to be a pop-up later on*/}
                        </form>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default SubmissionPage;