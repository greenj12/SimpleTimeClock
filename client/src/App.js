import { useState } from 'react';
import SignIn from './SignIn';
import TimeClock from './TimeClock';

function App() {
  const [userData, setUserData] = useState(null);

  return (
    <div className="app">
        {(userData === null) ? 
          <SignIn setUserData={(userData) => {setUserData(userData)}}/> :
          <TimeClock 
            userData={userData} 
            setUserData={(userData) => {setUserData(userData)}}/> }
    </div>
  );
}

export default App;
