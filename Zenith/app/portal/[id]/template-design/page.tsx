import { notFound } from 'next/navigation';
import { getLead, getBookedDates } from './actions';
import { getFeaturedPresets } from '@/lib/featured';
import { PortalClient } from './PortalClient';

export default async function PortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, blockedDates] = await Promise.all([getLead(id), getBookedDates()]);
  if (!lead) notFound();

  const featured = getFeaturedPresets();

  return <PortalClient lead={lead} featured={featured} blockedDates={blockedDates} />;
}
