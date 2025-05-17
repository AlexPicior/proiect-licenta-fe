'use client';
import { createContext, useContext, useState } from 'react';

type GlobalContextType = {
    authInfo: any;
    setAuthInfo: React.Dispatch<React.SetStateAction<any>>;
    notificationsNumber: number;
    setNotificationsNumber: React.Dispatch<React.SetStateAction<number>>;
    requestNotificationsNumber: number;
    setRequestNotificationsNumber: React.Dispatch<React.SetStateAction<number>>;
    approvalNotificationsNumber: number;
    setApprovalNotificationsNumber: React.Dispatch<React.SetStateAction<number>>;
    triggerNotificationsReload: any;
    setTriggerNotificationsReload: React.Dispatch<React.SetStateAction<any>>;
  };

const GlobalContext = createContext<GlobalContextType>({
    authInfo: null,
    setAuthInfo: () => {},
    notificationsNumber: 0,
    setNotificationsNumber: () => {},
    requestNotificationsNumber: 0,
    setRequestNotificationsNumber: () => {},
    approvalNotificationsNumber: 0,
    setApprovalNotificationsNumber: () => {},
    triggerNotificationsReload: null,
    setTriggerNotificationsReload: () => {},
});

export const GlobalContextProvider = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
    const [authInfo, setAuthInfo] = useState(null);
    const [notificationsNumber, setNotificationsNumber] = useState(0);
    const [requestNotificationsNumber, setRequestNotificationsNumber] = useState(0);
    const [approvalNotificationsNumber, setApprovalNotificationsNumber] = useState(0);
    const [triggerNotificationsReload, setTriggerNotificationsReload] = useState();
    return (
    <GlobalContext.Provider 
        value={{ 
            authInfo,
            setAuthInfo,
            notificationsNumber,
            setNotificationsNumber,
            requestNotificationsNumber, 
            setRequestNotificationsNumber,
            approvalNotificationsNumber,
            setApprovalNotificationsNumber,
            triggerNotificationsReload,
            setTriggerNotificationsReload
        }}
    >
        {children}
    </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);