import React, { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar, IonText, IonLoading, IonToast } from '@ionic/react';
import axios from 'axios';
import isValid from "uk-postcode-validator";

const SubmissionPage: React.FC = () => {
    const [post_code, setPostCode] = useState('');
    const [solar_panels, setSolarPanels] = useState<number>(1);
    const [date, setDate] = useState<string>('');
    const [isTrue, setIsTrue] = useState(true);
    const [postCodeError, setPostCodeErrorMessage] = useState<string>('');
    const [solarPanelError, setPanelErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const [postCodeForAPI, setPostCodeForAPI] = useState<string>('');
    const [temperature, setTemperature] = useState<number | null>(null);
    const [cloud_cover, setCloudCover] = useState<string | null>(null);

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!isTrue) {
            return;
        }

        const data = {
            post_code: postCodeForAPI,
            number_of_solar_panels: solar_panels,
            date: date
        };

        console.log('Data:', data);

        setIsLoading(true);

        // Fetch Weather Data 
        try {
            const weatherResponse = await axios.post(`https://api.finnhagan.co.uk/api/weatherdata/`, data);
            console.log(weatherResponse.data);
            axios.defaults.headers.post['Content-Type'] = 'application/json';
            setTemperature(weatherResponse.data.temperature);
            setCloudCover(weatherResponse.data.cloud_cover);
        } catch (error) {
            console.error("Error fetching weather:", error);
        }


        // Send Submission (including weather data)
        try {
            const submissionData = {
                post_code: post_code,
                number_of_solar_panels: solar_panels,
                date: date,
                temperature: temperature,
                cloud_cover: cloud_cover
            };

            const submissionResponse = await axios.post(`https://api.finnhagan.co.uk/api/submission/`, submissionData);
            console.log('Success:', submissionResponse.data);
            console.log('Full Axios Response:', submissionResponse);
            setShowToast(true);

        } catch (error) {
            console.error('Submission Error:', error);
        } finally {
            setIsLoading(false);
            setTimeout(() => { setShowToast(false) }, 3000);
        }
    };

    const handlePostCodeChange = (e: CustomEvent) => {
        const value = e.detail.value as string;
        const isValidPostcode = isValid(value);
        setIsTrue(isValidPostcode);

        const transformedPostcode = value.substring(0, 3) + ",GB"; // Transform to format required by API
        setPostCodeForAPI(transformedPostcode);

        setPostCode(value);

        if (!isValidPostcode) {
            setPostCodeErrorMessage('Invalid UK Postcode. Please try again.');
        } else {
            setPostCodeErrorMessage('');
        }
    };

    const handleSolarPanelsChange = (e: CustomEvent) => {
        const value = parseInt(e.detail.value, 10);
        if (!isNaN(value) && value > 0) {
            setSolarPanels(value);
            setPanelErrorMessage(''); // Clear error state if input is valid
        } else {
            setPanelErrorMessage("Please enter a valid number of panels (greater than 0).");
        }
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
                        <IonLoading isOpen={isLoading} message="Submission in progress... calculating optimal time " />
                        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message="Submission successful!" color="success" duration={3000} />
                        <form onSubmit={handleSubmit}>
                            <IonInput fill="outline" label="Number of Solar Panels" required labelPlacement="floating" type="number" value={solar_panels.toString()} onIonChange={handleSolarPanelsChange} min="1" step="1" />
                            {solarPanelError && <IonText color="danger"><sub>{solarPanelError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Post Code" labelPlacement="floating" required value={post_code} onIonChange={handlePostCodeChange} />
                            {!isTrue && <IonText color="danger"><sub>{postCodeError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Date" labelPlacement="floating" required type="date" placeholder="Date" value={date} onIonChange={handleDateChange}></IonInput>
                            <IonButton disabled={!isTrue || solarPanelError !== ''} className="ion-margin-top" expand="block" type="submit" shape="round" color="success">
                                Submit
                            </IonButton>
                        </form>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default SubmissionPage;