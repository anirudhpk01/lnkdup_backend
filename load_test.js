import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp-up to 10 requests per second
    { duration: '3m', target: 10 }, // Stay at 10 requests per second for 3 minutes
    { duration: '1m', target: 0 },  // Ramp-down to 0 requests per second
  ],
};

export default function () {
  const url = 'http://localhost:3000/api/upload';
  const payload = JSON.stringify({
    link: 'https://www.google.com/search?q=what+is+dockerfile&rlz=1C5CHFA_enIN1123IN1123&oq=what+is+dockerfile&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDINCAkQABiGAxiABBiKBdIBCTExMTk4ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Sending POST request
  let res = http.post(url, payload, params);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  // Test the GET short URL (adjust as needed)
  res = http.get('http://localhost:3000/example-short-id');
  check(res, {
    'is status 302': (r) => r.status === 302, // Redirect
  });

  sleep(1); // Pause between requests
}
