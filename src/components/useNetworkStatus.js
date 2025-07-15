import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useNetworkStatus = async () =>
{
  const state = await NetInfo.fetch();
  return state.isConnected;
}