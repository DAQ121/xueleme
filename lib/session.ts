import * as next_headers from 'next/headers';

const SESSION_COOKIE_NAME = 'user-session';

export async function getUserIdFromSession() {
  const session = next_headers.cookies().get(SESSION_COOKIE_NAME)?.value;
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.userId as string | null;
    } catch (error) {
      return null;
    }
  }
  return null;
}
