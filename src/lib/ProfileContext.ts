import { createContext, useContext } from 'react';
import type { UserProfileData } from '../types';
import { SURAJ_PROFILE } from '../data/surajProfile';

/** The live profile (loaded from the server; defaults to the bundled resume until it arrives). */
export const ProfileContext = createContext<UserProfileData>(SURAJ_PROFILE);

export const useProfile = () => useContext(ProfileContext);
