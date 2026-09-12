import React from 'react';
import { getCollections } from '@/lib/data/store';
import CollectionManagerClient from '@/components/admin/CollectionManagerClient';

export const revalidate = 0;

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return <CollectionManagerClient initialCollections={collections} />;
}
