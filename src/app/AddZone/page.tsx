import dynamic from 'next/dynamic';

const AddZone = dynamic(() => import('@/components/zone/addzonecomp').then((mod) => mod.default), {
  ssr: false,
});

export default AddZone;