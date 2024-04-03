import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import React from 'react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Register from './pages/Register';
import SubmissionPage from './pages/SubmissionPage';
import OptimalUsagePage from './pages/OptimalUsagePage';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import appLogo from '/src/assets/app-logo.png';

setupIonicReact();

const App: React.FC = () => (
  <AuthProvider>
    <IonApp>
      <div style={{ display: 'none' }}>
        <img src={appLogo} alt="" style={{ display: 'none' }} />
      </div>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/">
            <Login />
          </Route>
          <Route component={Register} path="/register" exact />
          <Route component={SubmissionPage} path="/submissionPage" exact />
          <Route component={OptimalUsagePage} path="/optimalUsagePage/:submissionId" exact />
          <Route component={Profile} path="/profile" exact />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </AuthProvider>
);

export default App;
