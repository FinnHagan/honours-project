import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { homeOutline, personCircleOutline } from 'ionicons/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { format, parseISO } from 'date-fns';

// const apiURL = "http://127.0.0.1:8000/api";
const apiURL = "https://api.finnhagan.co.uk/api";

interface RouteParams {
    submissionId: string;
}

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
    const router = useIonRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${apiURL}/submission_chart_data/${submissionId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            }).then((response) => {
                const { hourly_solar_production, appliance_consumption, wm_optimal_usage, td_optimal_usage } = response.data;

                // Prepare the solar production data for the chart
                const solar_production_data = hourly_solar_production.map((item: { hour: any; production: any; }) => ({
                    x: format(parseISO(`${new Date().toISOString().split('T')[0]}T${item.hour}:00`), 'HH:mm'),
                    y: item.production,
                }));

                // Filter the appliance consumption data based on user selection
                const filteredApplianceConsumption = appliance_consumption.filter((item: { appliance_name: string; }) =>
                    (wm_optimal_usage.length > 0 && item.appliance_name === 'washing_machine') ||
                    (td_optimal_usage.length > 0 && item.appliance_name === 'tumble_dryer')
                );

                // Map the filtered appliance consumption data
                const applianceConsumptionData = filteredApplianceConsumption.map((item: { timestamp: any; consumption: any; }) => ({
                    x: format(parseISO(`${new Date().toISOString().split('T')[0]}T${item.timestamp}`), 'HH:mm'),
                    y: item.consumption,
                }));

                // Combine timestamps from both solar production and appliance consumption to ensure all data overlaps correctly
                const allTimestamps = new Set([
                    ...solar_production_data.map((data: { x: any; }) => data.x),
                    ...applianceConsumptionData.map((data: { x: any; }) => data.x),
                ]);
                const labels = Array.from(allTimestamps).sort((a, b) => (a > b ? 1 : -1));

                // Initialize datasets with solar production data
                let datasets = [
                    {
                        label: 'Solar Production (Wh)',
                        data: solar_production_data,
                        borderColor: 'rgb(255, 205, 86)',
                        backgroundColor: 'rgba(255, 205, 86, 0.5)',
                        type: 'line' as 'line',
                        fill: true,
                    }
                ];

                // Dynamically add appliance consumption data to the datasets based on user selection
                if (wm_optimal_usage.length > 0) {
                    datasets.push({
                        label: 'Washing Machine Consumption (Wh)',
                        data: applianceConsumptionData.filter((d: { x: any; }) => appliance_consumption.find((ac: { timestamp: any; appliance_name: string; }) => ac.timestamp === d.x && ac.appliance_name === 'washing_machine')),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        type: 'line',
                        fill: false,
                    });
                }
                if (td_optimal_usage.length > 0) {
                    datasets.push({
                        label: 'Tumble Dryer Consumption (Wh)',
                        data: applianceConsumptionData.filter((d: { x: any; }) => appliance_consumption.find((ac: { timestamp: any; appliance_name: string; }) => ac.timestamp === d.x && ac.appliance_name === 'tumble_dryer')),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        type: 'line',
                        fill: false,
                    });
                }

                setChartData({
                    labels,
                    datasets,
                });
            }).catch((error) => {
                console.error('Error fetching submission data:', error.response.data);
            });
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
                        <IonButton onClick={(handleBack)}>
                            <IonIcon icon={homeOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className='ion-text-center'>Optimal Usage Chart</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => router.push('/profile')}>
                            <IonIcon icon={personCircleOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Line data={chartData} options={options} />
            </IonContent>
        </IonPage >
    );
};

export default OptimalUsagePage;