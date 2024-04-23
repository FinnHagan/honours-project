import React from 'react';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import introImage1 from '../assets/intro-image-1.jpg';
import introImage2 from '../assets/intro-image-2.jpg';
import introImage3 from '../assets/intro-image-3.jpg';
import introImage4 from '../assets/intro-image-4.jpg';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import './Introduction.css';

interface IntroductionProps {
    onIntroViewed: () => void;
}

const NextSlide = ({ children }: any) => {
    const swiper = useSwiper();
    return <IonButton className='font-bold' expand='block' shape='round' color="success" onClick={() => swiper.slideNext()}>{children}</IonButton>
}

const Introduction: React.FC<IntroductionProps> = ({ onIntroViewed }) => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='primary'>
                    <IonTitle className='ion-text-center'>Introduction</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonCard>
                    <IonCardContent>
                        <Swiper>
                            <SwiperSlide>
                                <IonText className='font-bold' color="success">
                                    <h1>Welcome to Should I Put My Washing On</h1>
                                </IonText>
                                <IonText>
                                    <h1>Get started by registering and logging in, so that you can access personalised solar energy usage optimisation.</h1>
                                </IonText>
                                <img src={introImage1} alt="Introduction Slide 1" />
                                <NextSlide>Next</NextSlide>
                            </SwiperSlide>
                            <SwiperSlide>
                                <IonText className='font-bold' color="success">
                                    <h1>Submission Form General Details</h1>
                                </IonText>
                                <IonText>
                                    <h1>We require your post code to get your geopgraphical location for our calculation and we also need the date you want to put the selected appliance(s) on. (The time selected on the form is irrelevant)</h1>
                                </IonText>
                                <img src={introImage2} alt="Submission Form Technical Details" />
                                <NextSlide>Next</NextSlide>
                            </SwiperSlide>
                            <SwiperSlide>
                                <IonText className='font-bold' color="success">
                                    <h1>Submission Form Technical Details</h1>
                                </IonText>
                                <IonText>
                                    <h1>Enter your solar panel orientation, tilt angle, and the number of solar panels you have, so we can calculate your predicted solar energy output for the day.</h1>
                                </IonText>
                                <img src={introImage3} alt="Introduction Slide 3" />
                                <NextSlide>Next</NextSlide>
                            </SwiperSlide>
                            <SwiperSlide>
                                <IonText color="success">
                                    <h1>Optimise Your Energy Use</h1>
                                </IonText>
                                <IonText>
                                    <h1>After submission, you will see a graph of your solar production and appliance usage, and the optimal time to put on your appliance(s). Click on the dots of the different lines on the graph to see detailed energy consumption and production times.</h1>
                                </IonText>
                                <img src={introImage4} alt="Introduction Slide 4" />
                                <IonButton className='font-bold' expand='block' shape='round' color="success" onClick={() => onIntroViewed()}>Take me there!</IonButton>
                            </SwiperSlide>
                        </Swiper>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Introduction;