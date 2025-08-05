import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
// import awsconfig from './aws-exports';

// Amplify.configure(awsconfig);

function Login() {
  return (
    <div style={styles.container}>
      <Authenticator>
        {({ signOut, user }) => (
          <main style={styles.main}>
            <h1>Welcome {user.username}</h1>
            <button onClick={signOut} style={styles.button}>
              Sign out
            </button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  main: {
    padding: '2rem',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ff9900',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem'
  }
};

export default Login;