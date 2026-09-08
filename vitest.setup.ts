import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Valeur de test uniquement : permet aux tests de RegistrationForm/register-api
// d'exercer le vrai chemin d'appel réseau (mocké via vi.spyOn(fetch)) plutôt
// que le repli "pas d'URL configurée".
process.env.NEXT_PUBLIC_API_URL ??= 'http://localhost:3001/api';

// @testing-library/react's automatic cleanup only self-registers when it finds
// `afterEach` on the global scope; this project imports test helpers explicitly
// from 'vitest' instead of enabling globals, so cleanup is wired up here.
afterEach(() => {
  cleanup();
});
