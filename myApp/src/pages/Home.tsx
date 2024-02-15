import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Should I Put My Washing On?</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Should I Put My Washing On?</IonTitle>
          </IonToolbar>
        </IonHeader>
        Finn
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
