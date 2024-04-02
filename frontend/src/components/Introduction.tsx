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
                                    <h1>Optimise solar energy usage?</h1>
                                </IonText>
                                <img src={introImage1} alt="Introduction Slide 1" />
                                <NextSlide>Next</NextSlide>
                            </SwiperSlide>
                            <SwiperSlide>
                                <IonText className='font-bold' color="success">
                                    <h1>Save money on electricity?</h1>
                                </IonText>
                                <img src={introImage2} alt="Introduction Slide 2" />
                                <NextSlide>Next</NextSlide>
                            </SwiperSlide>
                            <SwiperSlide>
                                <IonText className='font-bold' color="success">
                                    <h1>While saving the environment?</h1>
                                </IonText>
                                <img src={introImage3} alt="Introduction Slide 3" />
                                <NextSlide>Next</NextSlide>
                            </SwiperSlide>
                            <SwiperSlide>
                                <IonText className='font-bold' color="success">
                                    <h1>Should I Put My Washing On?</h1>
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