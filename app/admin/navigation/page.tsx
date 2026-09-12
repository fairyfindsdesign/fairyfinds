import React from 'react';
import { getNavigation } from '@/lib/data/store';
import NavbarManagerClient from '@/components/admin/NavbarManagerClient';

export const revalidate = 0;

export default async function AdminNavigationPage() {
  const navigation = await getNavigation();

  return <NavbarManagerClient initialNavigation={navigation} />;
}
