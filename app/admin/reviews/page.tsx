import React from 'react';
import { getReviews } from '@/lib/data/store';
import ReviewsManagerClient from '@/components/admin/ReviewsManagerClient';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return <ReviewsManagerClient initialReviews={reviews} />;
}
