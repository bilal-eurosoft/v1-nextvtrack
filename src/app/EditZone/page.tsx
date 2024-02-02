import dynamic from 'next/dynamic';

const EditZone = dynamic(() => import('@/components/zone/editzonecomp').then((mod) => mod.default), {
  ssr: false,
});

export default EditZone;