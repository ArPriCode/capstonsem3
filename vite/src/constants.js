let ENDPOINT = 'http://localhost:8001';

if (import.meta.env.PROD) {
  ENDPOINT = 'http://localhost:8001';
} else if (import.meta.env.MODE === 'development') {
  ENDPOINT = 'http://localhost:8001';
}

export default ENDPOINT;
// let ENDPOINT = "http://localhost:8085";

// if (import.meta.env.PROD) {
//   ENDPOINT = "https://caps-003.onrender.com";
// }

// export default ENDPOINT;
