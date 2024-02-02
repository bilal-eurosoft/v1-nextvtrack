import dynamic from 'next/dynamic';

const journeyReplay = dynamic(() => import('@/components/JourneyReplay/journeyreplay').then((mod) => mod.default), {
  ssr: false,
});

export default journeyReplay;