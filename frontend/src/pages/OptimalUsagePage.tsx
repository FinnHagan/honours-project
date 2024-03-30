import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { format, parseISO } from 'date-fns';

// const apiURL = "http://127.0.0.1:8000/api";
const apiURL = "https://api.finnhagan.co.uk/api";
const token = localStorage.getItem('token');

interface RouteParams {
    submissionId: string;
}

// Define MyChartData
interface ChartDataset {
    label: string;
    data: Array<{ x: string; y: number }> | number[];
    borderColor: string;
    backgroundColor?: string;
    fill: boolean;
    type?: 'line';
}

interface MyChartData {
    labels: string[];
    datasets: ChartDataset[];
}


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const OptimalUsagePage: React.FC = () => {

    const handleBack = () => {
        window.location.href = '/submissionPage';
    };


    const { submissionId } = useParams<RouteParams>();
    const [chartData, setChartData] = useState<MyChartData>({ labels: [], datasets: [] });


    const processApplianceConsumptionData = (appliance_name: string, applianceConsumptionData: any[]) => {
        return applianceConsumptionData
            .filter((item: { appliance_name: string; }) => item.appliance_name === appliance_name)
            .map((item: { timestamp: any; consumption: any; }) => {
                // Ensure the timestamp is parsed correctly
                const dateTime = parseISO(`${new Date().toISOString().split('T')[0]}T${item.timestamp}`);
                return {
                    x: format(dateTime, 'HH:mm'), // Keep the exact timestamp
                    y: item.consumption
                };
            });
    };
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${apiURL}/submission_chart_data/${submissionId}/`, {
                headers: {
                    'Authorization': `Token ${token}` // Include the token in the request headers
                },
            }).then((response) => {
                const { hourly_solar_production, appliance_consumption } = response.data;

                // Prepare the data for the solar production and appliances
                const solar_production_data = hourly_solar_production.map((item: { hour: any; production: any; }) => ({
                    x: format(parseISO(`${new Date().toISOString().split('T')[0]}T${item.hour}:00`), 'HH:mm'),
                    y: item.production,
                }));

                const wm_consumption_data = processApplianceConsumptionData('washing_machine', appliance_consumption);
                const td_consumption_data = processApplianceConsumptionData('tumble_dryer', appliance_consumption);

                // Combine all timestamps into a unified set of labels
                const allTimestamps = new Set([
                    ...solar_production_data.map((data: { x: any; }) => data.x),
                    ...wm_consumption_data.map((data: { x: any; }) => data.x),
                    ...td_consumption_data.map((data: { x: any; }) => data.x),
                ]);
                const labels = Array.from(allTimestamps).sort((a, b) => (a > b ? 1 : -1)); //Ensures lines overlap, rather than go side by side

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Solar Production (Wh)',
                            data: solar_production_data,
                            borderColor: 'rgb(255, 205, 86)',
                            backgroundColor: 'rgba(255, 205, 86, 0.5)',
                            type: 'line',
                            fill: true,
                        },
                        {
                            label: 'Washing Machine Consumption (Wh)',
                            data: wm_consumption_data,
                            borderColor: 'rgb(54, 162, 235)',
                            type: 'line',
                            fill: false,
                        },
                        {
                            label: 'Tumble Dryer Consumption (Wh)',
                            data: td_consumption_data,
                            borderColor: 'rgb(255, 99, 132)',
                            type: 'line',
                            fill: false,
                        },
                    ],
                });
            }).catch((error) => {
                console.error('Error fetching submission data:', error.response.data);
            });
        } else {
            console.error('No token found');
        }
    }, [submissionId]);



    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxRotation: 0, // Avoid labels rotation for better readability
                    font: {
                        size: 14,
                    },
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 14,
                    },
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
        },

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
                    <IonTitle>Optimal Usage Chart</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Line data={chartData} options={options} />
            </IonContent>
        </IonPage >
    );
};

export default OptimalUsagePage;