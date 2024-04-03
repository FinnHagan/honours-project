import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonLoading, IonButton, IonButtons, IonIcon, useIonRouter, IonText, IonRow, IonToast } from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { homeOutline, logOutOutline } from 'ionicons/icons';

// const apiURL = "https://api.finnhagan.co.uk/api";
const apiURL = "http://127.0.0.1:8000/api";

const Profile: React.FC = () => {
    const router = useIonRouter();
    const { token, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [profileDetails, setProfileDetails] = useState<any>(null);
    const [showToast, setShowToast] = useState(false);

    const handleLogout = () => {
        logout();
        setShowToast(true);
        router.push('/');
    };

    useEffect(() => {
        const fetchProfileDetails = async () => {
            if (!token) return;
            setIsLoading(true);
            try {
                const response = await axios.get(`${apiURL}/userprofile/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                setProfileDetails(response.data);
            } catch (error) {
                console.error('Failed to fetch profile details', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileDetails();
    }, [token]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonButton onClick={() => router.push('/submissionPage')}>
                            <IonIcon icon={homeOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className="ion-text-center">{profileDetails?.username}'s Profile</IonTitle>
                    <IonText className="ion-margin-horizontal font-bold" slot='end'>Signed in</IonText>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={isLoading} message="Loading your profile..." />
                <IonCard>
                    <IonCardContent>
                        <IonText>Username: {profileDetails?.username}</IonText>
                        <IonRow className='ion-justify-content-between ion-align-items-center ion-margin-top'></IonRow>
                        <IonText>Email: {profileDetails?.email}</IonText>
                        <IonButton onClick={handleLogout} className="ion-margin-top font-bold" expand="block" shape="round" color="danger" >
                            Sign Out
                            <IonIcon slot="end" icon={logOutOutline} />
                        </IonButton>
                        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={profileDetails?.username + " Signed out"} color="success" duration={3000}></IonToast>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Profile;
