import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonText, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import { homeOutline } from 'ionicons/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { addMinutes, format, parseISO } from 'date-fns';

const apiURL = "http://127.0.0.1:8000/api";
// const apiURL = "https://api.finnhagan.co.uk/api";

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${apiURL}/submission_chart_data/${submissionId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            }).then((response) => {
                const { hourly_solar_production, appliance_consumption, wm_optimal_usage, td_optimal_usage } = response.data;

                const solar_production_data = hourly_solar_production.map((item: { hour: any; production: any; }) => ({
                    x: format(parseISO(`${new Date().toISOString().split('T')[0]}T${item.hour}:00`), 'HH:mm'),
                    y: item.production,
                }));

                // Generate timestamps for appliance usage starting from their optimal usage times
                const generateApplianceData = (optimalUsageTime: string, applianceName: string) => {
                    const startDateTime = parseISO(`${new Date().toISOString().split('T')[0]}T${optimalUsageTime}`);
                    return appliance_consumption
                        .filter((item: any) => item.appliance_name === applianceName)
                        .map((item: any, index: number) => ({
                            x: format(addMinutes(startDateTime, index * 10), 'HH:mm'),
                            y: item.consumption,
                        }));
                };

                // Create datasets for washing machine and tumble dryer based on their optimal usage times
                const datasets: ChartDataset[] = [
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
                        data: generateApplianceData(wm_optimal_usage, 'washing_machine'),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        fill: false,
                    },
                    {
                        label: 'Tumble Dryer Consumption (Wh)',
                        data: generateApplianceData(td_optimal_usage, 'tumble_dryer'),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        fill: false,
                    },
                ];

                // Extract all timestamps from datasets for labels
                const allTimestamps = new Set(datasets.flatMap(dataset => dataset.data.map((d: any) => d.x)));
                const labels = Array.from(allTimestamps).sort();

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
                        <IonButton onClick={handleBack}>
                            <IonIcon icon={homeOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className='ion-text-center'>Optimal Usage Chart</IonTitle>
                    <IonText className="ion-margin-horizontal font-bold" slot='end'>Signed in</IonText>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Line data={chartData} options={options} />
            </IonContent>
        </IonPage >
    );
};

export default OptimalUsagePage;