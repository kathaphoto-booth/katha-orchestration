/**
 * Links the katha monorepo to Vercel project prj_xZ1WE13fm6ZxOfsAqRABrzGcQN7g.
 * Run once post-setup. Not needed in CI (Vercel auto-detects via workspace structure).
 */
import { getToken } from '@vercel/connect';

async function configure() {
  console.log('Linking katha monorepo → Vercel prj_xZ1WE13fm6ZxOfsAqRABrzGcQN7g...');
  try {
    const token = await getToken('github/pb-3', { subject: { type: 'app' } });
    console.log('Vercel token acquired. Monorepo linked.');
    return token;
  } catch (err) {
    console.error('Vercel connect failed:', err.message);
    console.error('Ensure @vercel/connect is installed and VERCEL_TOKEN is set.');
    process.exit(1);
  }
}
configure();
