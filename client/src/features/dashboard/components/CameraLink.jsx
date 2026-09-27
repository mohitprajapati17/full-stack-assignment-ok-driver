import { Link } from 'react-router';

/** Links to the camera when it is still registered; otherwise shows the raw camera ID. */
export function CameraLink({ camera, cameraId }) {
  if (!camera) return <span className="font-mono">{cameraId}</span>;
  return (
    <Link to={`/cameras/${camera.id}`} className="text-slate-300 hover:text-white hover:underline">
      {camera.name} <span className="font-mono text-slate-500">({camera.cameraId})</span>
    </Link>
  );
}
