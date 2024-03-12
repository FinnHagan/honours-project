import React, { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar, IonText, IonLoading, IonToast } from '@ionic/react';
import axios from 'axios';
import isValid from "uk-postcode-validator";

const apiURL = "https://api.finnhagan.co.uk/api";

//Define the interfaces for the data being sent to API
interface WeatherData {
    post_code: string;
    number_of_solar_panels: number;
    date: string;
}

interface SubmissionData extends WeatherData {
    temperature: number | null;
    cloud_cover: string | null;
}

//Gets user input from form and sends it to the API
const fetchWeatherData = async (data: WeatherData) => {
    console.log("API URL:", `${apiURL}/weatherdata/`)
    return axios.post(`${apiURL}/weatherdata/`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
};

//Submits the combined data to the API
const submitData = async (data: SubmissionData) => {
    return axios.post(`${apiURL}/submission/`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
};

const SubmissionPage: React.FC = () => {
    const [formData, setFormData] = useState({
        postCode: '',
        solarPanels: 1,
        date: '',
        isValid: true,
        postCodeError: '',
        solarPanelError: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!formData.isValid) {
            return;
        }

        const data = {
            post_code: `${formData.postCode.substring(0, 3)},GB`, // Format the postcode to match the API call format
            number_of_solar_panels: formData.solarPanels,
            date: formData.date,
        };

        setIsLoading(true);

        try {
            const weatherResponse = await fetchWeatherData(data);
            const submissionData = {
                post_code: formData.postCode,
                number_of_solar_panels: formData.solarPanels,
                date: formData.date,
                temperature: weatherResponse.data.temperature, //Need to get data directly from weather response so it isn't set as null
                cloud_cover: weatherResponse.data.cloud_cover, //Need to get data directly from weather response so it isn't set as null
            };
            await submitData(submissionData);
            setShowToast(true);
        } catch (error) {
            console.error("Error fetching weather or submitting data:", error);
        } finally {
            setIsLoading(false);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleInputChange = (name: string, value: any) => {
        if (name === 'postCode') {
            const isValidPostcode = isValid(value);
            setFormData({
                ...formData,
                [name]: value,
                isValid: isValidPostcode, //Use isValid from Uk postcode validator to check if the postcode is valid
                postCodeError: isValidPostcode ? '' : 'Invalid UK Postcode. Please try again.',
            });
        } else if (name === 'solarPanels') {
            const valid = !isNaN(value) && value > 0;
            setFormData({
                ...formData,
                [name]: value,
                solarPanelError: valid ? '' : "Please enter a valid number of panels (greater than 0).",
            });
        } else {
            setFormData({ ...formData, [name]: value });
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
                        <IonLoading isOpen={isLoading} message="Submission in progress... calculating optimal time " />
                        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message="Submission successful!" color="success" duration={3000} />
                        <form onSubmit={handleSubmit}>
                            <IonInput fill="outline" label="Number of Solar Panels" required labelPlacement="floating" type="number" value={formData.solarPanels.toString()} onIonChange={(e) => handleInputChange('solarPanels', parseInt(e.detail.value ?? '0', 10))} min="1" step="1" />
                            {formData.solarPanelError && <IonText color="danger"><sub>{formData.solarPanelError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Post Code" labelPlacement="floating" required value={formData.postCode} onIonChange={(e) => handleInputChange('postCode', e.detail.value)} />
                            {!formData.isValid && <IonText color="danger"><sub>{formData.postCodeError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Date" labelPlacement="floating" required type="date" placeholder="Date" value={formData.date} onIonChange={(e) => handleInputChange('date', e.detail.value)}></IonInput>
                            <IonButton disabled={!formData.isValid || formData.solarPanelError !== ''} className="ion-margin-top" expand="block" type="submit" shape="round" color="success">
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