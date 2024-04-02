import React, { useState } from 'react';
import { IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar, IonText, IonLoading, IonToast, IonCheckbox, IonRow, useIonRouter, IonIcon } from '@ionic/react';
import axios from 'axios';
import isValid from "uk-postcode-validator";
import { arrowBack } from 'ionicons/icons';

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
    wm_optimal_usage?: string[];
    td_optimal_usage?: string[];
    hourly_solar_production?: string[];
    appliance_consumption?: string[];
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
    const token = localStorage.getItem('token');
    return axios.post(`${apiURL}/weatherdata/`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    });
};

const fetchSolarData = async (data: WeatherData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${apiURL}/solardata/`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    });
};

//Submits the combined data to the API
const submitData = async (data: SubmissionData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${apiURL}/submission/`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    });
};

const SubmissionPage: React.FC = () => {

    const handleBack = () => {
        window.location.href = '/';
    };

    const [formData, setFormData] = useState({
        postCode: '',
        solarPanels: '',
        panelOrientation: '',
        panelTilt: '',
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

    const [formKey, setFormKey] = useState(Date.now()); //Ensure form is reset after submission


    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!formData.isValid) {
            return;
        }

        // Convert string values to numbers, with a fallback for non-numeric inputs
        const number_of_solar_panels = parseInt(formData.solarPanels, 10) || 0;
        const panel_orientation = parseFloat(formData.panelOrientation) || 0;
        const panel_tilt = parseFloat(formData.panelTilt) || 0;

        const data = {
            post_code: `${formData.postCode.substring(0, 3)},GB`, // Format the postcode to match the API call format
            number_of_solar_panels,
            date: formData.date,
            panel_orientation,
            panel_tilt,
            washing_machine_selected: isWashingMachineSelected,
            tumble_dryer_selected: isTumbleDryerSelected,

        };

        setIsLoading(true);

        try {
            const weatherResponse = await fetchWeatherData(data);
            const solarResponse = await fetchSolarData(data);
            const submissionData = {
                post_code: formData.postCode,
                number_of_solar_panels,
                date: formData.date,
                panel_orientation,
                panel_tilt,
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
            setFormKey(Date.now());
            router.push(`/optimalUsagePage/${submissionId}/`);
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
            const parsedValue = parseInt(value, 10);
            const valid = value === '' || (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 100);
            setFormData({
                ...formData,
                solarPanels: valid ? value : formData.solarPanels,
                solarPanelError: valid ? '' : "Please enter a valid number of solar panels (1-100).",
            });
        } else if (name === 'panelOrientation') {
            const parsedValue = parseFloat(value);
            const valid = value === '' || (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 360);
            setFormData({
                ...formData,
                panelOrientation: valid ? value : formData.panelOrientation,
                panelOrientationError: valid ? '' : "Please enter a valid orientation (0-360 degrees).",
            });

        } else if (name === 'panelTilt') {
            const parsedValue = parseFloat(value);
            const valid = value === '' || (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 90);
            setFormData({
                ...formData,
                panelTilt: valid ? value : formData.panelTilt,
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
                        <IonButton onClick={handleBack}>
                            <IonIcon icon={arrowBack} />
                            Back
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Should I Put My Washing On?</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonCard>
                    <IonCardContent>
                        <IonLoading isOpen={isLoading} message="Submission in progress... calculating optimal time " />
                        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message="Submission successful!" color="success" duration={3000} />
                        <form onSubmit={handleSubmit} key={formKey}>
                            <IonInput label="Number of Solar Panels" required labelPlacement="floating" type="number" placeholder="Enter the number of solar panels installed" value={formData.solarPanels.toString()} onIonChange={(e) => handleInputChange('solarPanels', e.detail.value ?? '')} min="1" max="100" />
                            {formData.solarPanelError && <IonText className='ion-margin-top' color="danger"><sub>{formData.solarPanelError}</sub></IonText>}
                            <IonInput className="ion-margin-top" label="Panel Orientation" labelPlacement="floating" required type="number" placeholder="Degrees from North (e.g., 180)" value={formData.panelOrientation ?? ''} onIonChange={(e) => handleInputChange('panelOrientation', e.detail.value ?? '')} min="0" max="360" />
                            {formData.panelOrientationError && <IonText className='ion-margin-top' color="danger"><sub>{formData.panelOrientationError}</sub></IonText>}
                            <IonInput className="ion-margin-top" label="Panel Tilt Angle" labelPlacement="floating" required type="number" placeholder="Angle in degrees (e.g., 30)" value={formData.panelTilt ?? ''} onIonChange={(e) => handleInputChange('panelTilt', e.detail.value ?? '')} min="0" max="90" />
                            {formData.panelTiltError && <IonText className='ion-margin-top' color="danger"><sub>{formData.panelTiltError}</sub></IonText>}
                            <IonInput className="ion-margin-top" label="Post Code" labelPlacement="floating" required value={formData.postCode} placeholder='Enter a UK post code' onIonChange={(e) => handleInputChange('postCode', e.detail.value)} />
                            {!formData.isValid && <IonText className='ion-margin-top' color="danger"><sub>{formData.postCodeError}</sub></IonText>}
                            <IonInput className="ion-margin-top" label="Date" labelPlacement="floating" required type="datetime-local" placeholder="Date" value={formData.date} onIonChange={(e) => handleInputChange('date', e.detail.value)}></IonInput>
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