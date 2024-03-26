import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { ChartDataset, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface RouteParams {
    submissionId: string;
}

interface MyChartData {
    labels: string[];
    datasets: ChartDataset<'line', { x: string, y: number }[]>[];
}

interface HourlySolarProductionItem {
    hour: string;
    production: number;
}

const OptimalUsagePage: React.FC = () => {
    const { submissionId } = useParams<RouteParams>();
    const [chartData, setChartData] = useState<MyChartData>({ labels: [], datasets: [] });

    useEffect(() => {
        axios.get(`https://api.finnhagan.co.uk/api/submission_chart_data/${submissionId}/`)
            .then(response => {
                const { hourly_solar_production, appliance_consumption } = response.data;

                const labels = hourly_solar_production.map((item: HourlySolarProductionItem) => format(new Date(`${new Date().toISOString().split('T')[0]}T${item.hour}:00`), 'HH:mm'));

                const solarProductionData = hourly_solar_production.map((item: HourlySolarProductionItem) => ({
                    x: format(new Date(`${new Date().toISOString().split('T')[0]}T${item.hour}:00`), 'HH:mm'), // Use formatted hour as x
                    y: item.production,
                }));

                const wmConsumptionData = labels.map((label: string) => ({
                    x: label, // Match labels by position
                    y: appliance_consumption.washing_machine,
                }));

                const tdConsumptionData = labels.map((label: string) => ({
                    x: label, // Match labels by position
                    y: appliance_consumption.tumble_dryer,
                }));


                setChartData({
                    labels, // The formatted hours as labels
                    datasets: [
                        {
                            label: 'Solar Production (Wh)',
                            data: solarProductionData,
                            borderColor: 'rgb(255, 205, 86)',
                            backgroundColor: 'rgba(255, 205, 86, 0.5)',
                            type: 'line',
                        },
                        {
                            label: 'Washing Machine Consumption (Wh)',
                            data: wmConsumptionData,
                            borderColor: 'rgb(54, 162, 235)',
                            borderDash: [5, 5],
                            type: 'line',
                            fill: false,
                        },
                        {
                            label: 'Tumble Dryer Consumption (Wh)',
                            data: tdConsumptionData,
                            borderColor: 'rgb(255, 99, 132)',
                            borderDash: [5, 5],
                            type: 'line',
                            fill: false,
                        },
                    ],
                });
            })
            .catch(error => console.error("Error fetching chart data:", error));
    }, [submissionId]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        scales: {
            x: {
                type: 'category',
            },
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/submissionPage" />
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