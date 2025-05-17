import { redirect } from 'next/navigation';

export function getAuthInfo() {
    if (typeof window !== 'undefined') {
      const authInfo = localStorage.getItem('authInfo');
      return authInfo ? JSON.parse(authInfo) : null;
    }
    return null;
}


export function requireAuth(allowedRoles: string[] = [], callBack = (authInfo: any) => {}) {
  const authInfo: any = getAuthInfo();
  if (!authInfo) {
    redirect('/login');
  } else if (allowedRoles.length && !allowedRoles.includes(authInfo.userInfo.authority)) {
    redirect('/unauthorized');
  }
  callBack(authInfo);
}
  