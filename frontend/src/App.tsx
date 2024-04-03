import React from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import SubmissionPage from './pages/SubmissionPage';
import OptimalUsagePage from './pages/OptimalUsagePage';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';

// Core CSS required for Ionic components to work properly
import '@ionic/react/css/core.css';
// Basic CSS for apps built with Ionic
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
// Optional CSS utils that can be commented out
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
// Theme variables
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <AuthProvider>
    <IonApp>
      {/* Hidden img tag to ensure app-logo.jpg is included in the build */}
      <div style={{ display: 'none' }}>
        <img src={require('./assets/app-logo.jpg')} alt="" />
      </div>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/submissionPage" component={SubmissionPage} />
          <Route exact path="/optimalUsagePage/:submissionId" component={OptimalUsagePage} />
          <Route exact path="/profile" component={Profile} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </AuthProvider>
);

export default App;
