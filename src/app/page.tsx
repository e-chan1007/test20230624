"use client";

import { useEffect, useMemo, useState } from 'react'

export default function Home() {
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [shakeCount, setShakeCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const start = () => {
    const listener = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.acceleration || { x: 0, y: 0, z: 0};
      if(Math.abs(x ?? 0) + Math.abs(y ?? 0) + Math.abs(z ?? 0) > 15) {
        if(
          Math.sign(x ?? 0) !== Math.sign(acceleration.x ?? 0)
          || Math.sign(y ?? 0) !== Math.sign(acceleration.y ?? 0)
          || Math.sign(z ?? 0) !== Math.sign(acceleration.z ?? 0)
        ) {
          setShakeCount(shakeCount + 1);

          if(timeoutId) window.clearTimeout(timeoutId);
          setTimeoutId(window.setTimeout(() => {
            setShakeCount(0);
            setTimeoutId(null);
          }, 3000));
        }
      }
      setAcceleration({ x: x ?? 0, y: y ?? 0, z: z ?? 0 });
    };
    window.addEventListener("devicemotion", listener)
    return () => { window.removeEventListener("devicemotion", listener)}
  }

  useEffect(() => {
    if (
      window.DeviceMotionEvent &&
      (window.DeviceMotionEvent as any).requestPermission
    ) {
      (DeviceMotionEvent as any).requestPermission().then(start);
    } else {
      start();
    }
  }, []);


  const clipPath = useMemo(() => {
    const ratio = (1 - Math.min(1, shakeCount / 20)) * 100;
    return `polygon(0 ${ratio}%, 100% ${ratio}%, 100% 100%, 0 100%)`
  }, [shakeCount])

  return <main className="relative w-screen h-screen">
    <div className="z-0 absolute w-full h-full transition-all"  style={{ backgroundColor: "#EE8000", clipPath }} />
    <div className="z-10 absolute w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-lg">加速度</h1>
      <table>
        <tbody>
          <tr>
            <th className="px-4">X</th>
            <td className="px-4">{acceleration.x}</td>
          </tr>
          <tr>
            <th className="px-4">Y</th>
            <td className="px-4">{acceleration.y}</td>
          </tr>
          <tr>
            <th className="px-4">Z</th>
            <td className="px-4">{acceleration.z}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-4xl top-1/2 left-1/2">{shakeCount}</p>
    </div>
  </main>
}
