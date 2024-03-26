import React, { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar, IonText, IonLoading, IonToast, IonCheckbox, IonList, IonItem, IonLabel, IonRow, useIonRouter } from '@ionic/react';
import axios from 'axios';
import isValid from "uk-postcode-validator";

const apiURL = "https://api.finnhagan.co.uk/api";
// const apiURL = "http://127.0.0.1:8000/api";

//Define the interfaces for the data being sent to API
interface WeatherData {
    post_code: string;
    number_of_solar_panels: number;
    date: string;
    panel_orientation: number;
    panel_tilt: number;
    washing_machine_selected: boolean;
    tumble_dryer_selected: boolean;
}

interface SolarData {
    solar_altitude: number | null;
    solar_azimuth: number | null;
    daily_solar_output: number | null;
    optimal_time: string | null;
    optimal_power: number | null;
    wm_optimal_usage?: string[]; // New field for washing machine
    td_optimal_usage?: string[]; // New field for tumble dryer
    hourly_solar_production?: string[]; // New field for hourly solar production
    appliance_consumption?: string[]; // New field for appliance consumption
}


interface SubmissionData extends WeatherData {
    temperature: number | null;
    cloud_cover: string | null;
    wind_speed: number | null;
    wind_direction: string | null;
    humidity: number | null;
    precipitation: string | null;
    solar: SolarData;
}

//Gets user input from form and sends it to the API
const fetchWeatherData = async (data: WeatherData) => {
    return axios.post(`${apiURL}/weatherdata/`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
};
const fetchSolarData = async (data: WeatherData) => {
    return axios.post(`${apiURL}/solardata/`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
}

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
        panelOrientation: 0,
        panelTilt: 0,
        date: '',
        isValid: true,
        postCodeError: '',
        solarPanelError: '',
        panelOrientationError: '',
        panelTiltError: '',

    });
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const [isWashingMachineSelected, setIsWashingMachineSelected] = useState(false);
    const [isTumbleDryerSelected, setIsTumbleDryerSelected] = useState(false);

    const router = useIonRouter();


    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!formData.isValid) {
            return;
        }

        const data = {
            post_code: `${formData.postCode.substring(0, 3)},GB`, // Format the postcode to match the API call format
            number_of_solar_panels: formData.solarPanels,
            date: formData.date,
            panel_orientation: formData.panelOrientation,
            panel_tilt: formData.panelTilt,
            washing_machine_selected: isWashingMachineSelected,
            tumble_dryer_selected: isTumbleDryerSelected,

        };

        setIsLoading(true);

        try {
            const weatherResponse = await fetchWeatherData(data);
            const solarResponse = await fetchSolarData(data);
            const submissionData = {
                post_code: formData.postCode,
                number_of_solar_panels: formData.solarPanels,
                date: formData.date,
                panel_orientation: formData.panelOrientation,
                panel_tilt: formData.panelTilt,
                washing_machine_selected: data.washing_machine_selected,
                tumble_dryer_selected: data.tumble_dryer_selected,

                //Need to get data directly from weather response so it isn't set as null
                temperature: weatherResponse.data.temperature,
                cloud_cover: weatherResponse.data.cloud_cover,
                wind_speed: weatherResponse.data.wind_speed,
                wind_direction: weatherResponse.data.wind_direction,
                humidity: weatherResponse.data.humidity,
                precipitation: weatherResponse.data.precipitation,
                //Need to get data directly from solar response so it isn't set as null
                solar: {
                    solar_altitude: solarResponse.data.solar_altitude,
                    solar_azimuth: solarResponse.data.solar_azimuth,
                    daily_solar_output: solarResponse.data.daily_solar_output,
                    optimal_time: solarResponse.data.optimal_time,
                    optimal_power: solarResponse.data.optimal_power,
                    wm_optimal_usage: solarResponse.data.wm_optimal_usage,
                    td_optimal_usage: solarResponse.data.td_optimal_usage,
                    hourly_solar_production: solarResponse.data.hourly_solar_production,
                    appliance_consumption: solarResponse.data.appliance_consumption,
                },
            };
            const response = await submitData(submissionData);
            const submissionId = response.data.id;
            setShowToast(true);
            router.push(`/optimalUsagePage/${submissionId}/`);
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

        } else if (name === 'panelOrientation') {
            const parsedValue = parseFloat(value);
            const valid = !isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 360;
            setFormData({
                ...formData,
                [name]: parsedValue,
                panelOrientationError: valid ? '' : "Please enter a valid orientation (0-360 degrees).",
            });
        } else if (name === 'panelTilt') {
            const parsedValue = parseFloat(value);
            const valid = !isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 90;
            setFormData({
                ...formData,
                [name]: parsedValue,
                panelTiltError: valid ? '' : "Please enter a valid tilt angle (0-90 degrees).",
            });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCheckboxChange = (name: string, isChecked: boolean) => {
        if (name === 'washing_machine_selected') {
            setIsWashingMachineSelected(isChecked);
        } else if (name === 'tumble_dryer_selected') {
            setIsTumbleDryerSelected(isChecked);
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
                            <IonInput fill="outline" label="Number of Solar Panels" required labelPlacement="floating" type="number" placeholder="Enter the number of solar panels installed" value={formData.solarPanels.toString()} onIonChange={(e) => handleInputChange('solarPanels', parseInt(e.detail.value ?? '0', 10))} min="1" />
                            {formData.solarPanelError && <IonText className='ion-margin-top' color="danger"><sub>{formData.solarPanelError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Panel Orientation" labelPlacement="floating" required type="number" placeholder="Degrees from North (e.g., 180)" value={formData.panelOrientation ?? ''} onIonChange={(e) => handleInputChange('panelOrientation', e.detail.value ? parseFloat(e.detail.value) : null)} min="0" max="360" />
                            {formData.panelOrientationError && <IonText className='ion-margin-top' color="danger"><sub>{formData.panelOrientationError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Panel Tilt Angle" labelPlacement="floating" required type="number" placeholder="Angle in degrees (e.g., 30)" value={formData.panelTilt ?? ''} onIonChange={(e) => handleInputChange('panelTilt', e.detail.value ? parseFloat(e.detail.value) : null)} min="0" max="90" />
                            {formData.panelTiltError && <IonText className='ion-margin-top' color="danger"><sub>{formData.panelTiltError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Post Code" labelPlacement="floating" required value={formData.postCode} placeholder='Enter a UK post code' onIonChange={(e) => handleInputChange('postCode', e.detail.value)} />
                            {!formData.isValid && <IonText className='ion-margin-top' color="danger"><sub>{formData.postCodeError}</sub></IonText>}
                            <IonInput className="ion-margin-top" fill="outline" label="Date" labelPlacement="floating" required type="datetime-local" placeholder="Date" value={formData.date} onIonChange={(e) => handleInputChange('date', e.detail.value)}></IonInput>
                            <IonCheckbox className='ion-margin-top' checked={isWashingMachineSelected} onIonChange={(e) => handleCheckboxChange('washing_machine_selected', e.detail.checked)}>Washing Machine</IonCheckbox>
                            <IonRow className='ion-justify-content-between ion-align-items-center ion-margin-top'></IonRow>
                            <IonCheckbox className='ion-margin-top' checked={isTumbleDryerSelected} onIonChange={e => handleCheckboxChange('tumble_dryer_selected', e.detail.checked)}>Tumble Dryer</IonCheckbox>
                            <IonButton className="ion-margin-top" disabled={!formData.isValid || formData.solarPanelError !== '' || formData.panelOrientationError !== '' || formData.panelTiltError !== '' || !isWashingMachineSelected && !isTumbleDryerSelected} expand="block" type="submit" shape="round" color="success">
                                Submit
                            </IonButton>
                        </form>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage >
    );
};

export default SubmissionPage;